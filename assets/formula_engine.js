(function(root){
'use strict';
function evaluateFormulas(sheets, opts={}) {
  const maxFormulas=opts.maxFormulas??10000,maxReferences=opts.maxReferences??5000000,maxDepth=opts.maxDepth??300;
  const all=[],lookups=new Map(),names=new Map(),warnings=[];
  for(const sheet of sheets){
    const map=new Map();
    for(const cell of sheet.cells){map.set(cell.row+':'+cell.col,cell);if(cell.formula!==null&&cell.formula!==undefined)all.push([sheet,cell]);}
    lookups.set(sheet,map);names.set(String(sheet.name).toLowerCase(),sheet);
  }
  if(all.length>maxFormulas)throw Error('엑셀 수식 '+all.length+'개: 최대 '+maxFormulas+'개까지 처리합니다. 원본은 변경하지 않았습니다.');
  let referenced=0,recalculated=0,cached=0,unresolved=0;
  const state=new WeakMap();
  const addr=s=>{
    const m=/^\$?([A-Z]{1,3})\$?([1-9]\d{0,6})$/i.exec(s||'');
    if(!m)throw Error('지원하지 않는 수식 참조 '+String(s).slice(0,40));
    const col=[...m[1].toUpperCase()].reduce((v,c)=>v*26+c.charCodeAt(0)-64,0)-1,row=Number(m[2])-1;
    if(row>=10000||col>=120)throw Error('수식 참조 범위 초과: '+s);
    return {row,col};
  };
  const scalar=x=>{if(Array.isArray(x))throw Error('배열을 단일 값으로 사용할 수 없습니다.');return x===null||x===undefined?'':x;};
  const num=x=>{const v=scalar(x);if(v===''||v===false)return 0;if(v===true)return 1;const n=Number(v);if(!Number.isFinite(n))throw Error('숫자로 계산할 수 없는 수식 값');return n;};
  const truth=x=>{const v=scalar(x);return typeof v==='string'?v.length>0&&v!=='0':!!v;};
  const numberResult=n=>{if(!Number.isFinite(n)||Math.abs(n)>1e15)throw Error('수식 결과 범위 초과');return n;};
  function tokens(source){
    const s=String(source||'').replace(/^=/,'');
    if(s.length>2000)throw Error('수식 길이 한도 초과');
    const t=[];let i=0;
    while(i<s.length){
      const ch=s[i];if(/\s/.test(ch)){i++;continue;}
      if(ch==='"'){let q='';i++;let closed=false;for(;i<s.length;i++){if(s[i]==='"'){if(s[i+1]==='"'){q+='"';i++;}else{closed=true;i++;break;}}else q+=s[i];}if(!closed)throw Error('닫히지 않은 수식 문자열');t.push({type:'string',value:q});}
      else if(ch==="'"){let q='';i++;let closed=false;for(;i<s.length;i++){if(s[i]==="'"){if(s[i+1]==="'"){q+="'";i++;}else{closed=true;i++;break;}}else q+=s[i];}if(!closed)throw Error('닫히지 않은 시트 이름');t.push({type:'sheet',value:q});}
      else if(/\d/.test(ch)||(ch==='.'&&/\d/.test(s[i+1]||''))){const m=/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i));t.push({type:'number',value:Number(m[0])});i+=m[0].length;}
      else if(/[A-Za-z_$\u0080-\uffff]/.test(ch)){const m=/^\$?[A-Za-z]{1,3}\$?[1-9]\d{0,6}(?![A-Za-z0-9_])/.exec(s.slice(i));if(m){t.push({type:'ref',value:m[0]});i+=m[0].length;}else{const id=/^[A-Za-z_\u0080-\uffff][A-Za-z0-9_.\u0080-\uffff]*/.exec(s.slice(i));if(!id)throw Error('지원하지 않는 수식 이름');t.push({type:'id',value:id[0]});i+=id[0].length;}}
      else if('+-*/^&%=<>!(),:;'.includes(ch)){const two=s.slice(i,i+2);if(['<=','>=','<>'].includes(two)){t.push({type:two});i+=2;}else{t.push({type:ch});i++;}}
      else throw Error('지원하지 않는 수식 문법: '+ch);
      if(t.length>2000)throw Error('수식 표현식이 너무 복잡합니다.');
    }
    t.push({type:'end'});return t;
  }
  const precedence={'=':1,'<>':1,'<':1,'>':1,'<=':1,'>=':1,'&':2,'+':3,'-':3,'*':4,'/':4,'^':5};
  function ast(formula){
    const t=tokens(formula);let i=0;
    const peek=()=>t[i];const take=k=>{if(peek().type!==k)throw Error('수식 구문 오류: '+k);return t[i++];};
    function primary(){
      const current=t[i++];let node;
      if(['number','string'].includes(current.type))node={kind:'value',value:current.value};
      else if(current.type==='('){node=expr(0);take(')');}
      else if(['+','-'].includes(current.type))node={kind:'unary',op:current.type,value:expr(5)};
      else if(current.type==='id'&&peek().type==='('){
        i++;const args=[];if(peek().type!==')'){do{args.push(expr(0));if(![',',';'].includes(peek().type))break;i++;}while(true);}take(')');
        node={kind:'call',name:current.value.toUpperCase(),args};
      }
      else if(current.type==='id'&&/^(TRUE|FALSE)$/i.test(current.value))node={kind:'value',value:current.value.toUpperCase()==='TRUE'};
      else if(current.type==='ref'||(['id','sheet'].includes(current.type)&&peek().type==='!')){
        let sheet=null,ref=current.value;
        if(current.type!=='ref'){sheet=current.value;take('!');ref=take('ref').value;}
        node={kind:'cell',sheet,ref};
        if(peek().type===':'){i++;let endSheet=sheet,end=t[i++];if(['id','sheet'].includes(end.type)&&peek().type==='!'){endSheet=end.value;take('!');end=take('ref');}if(end.type!=='ref'||(endSheet!==sheet))throw Error('지원하지 않는 다중 시트 범위');node={kind:'range',sheet,from:ref,to:end.value};}
      }
      else throw Error('지원하지 않는 수식 항목: '+current.type);
      while(peek().type==='%'){i++;node={kind:'percent',value:node};}
      return node;
    }
    function expr(min){
      let left=primary();
      while(Object.hasOwn(precedence,peek().type)&&precedence[peek().type]>=min){
        const op=t[i++].type,p=precedence[op],right=expr(p+(op==='^'?0:1));left={kind:'binary',op,left,right};
      }
      return left;
    }
    const tree=expr(0);if(peek().type!=='end')throw Error('수식 마지막에 해석되지 않은 표현식');return tree;
  }
  const compare=(a,b)=>{
    if(typeof a==='number'||typeof b==='number'){const x=Number(a),y=Number(b);if(Number.isFinite(x)&&Number.isFinite(y))return x===y?0:x<y?-1:1;}
    const x=String(a??'').toLowerCase(),y=String(b??'').toLowerCase();return x===y?0:x<y?-1:1;
  };
  function matches(value,criterion){
    let condition=String(criterion??'');const op=/^(<=|>=|<>|=|<|>)/.exec(condition)?.[0]||'=';
    if(condition.startsWith(op))condition=condition.slice(op.length);
    const cmp=compare(value,condition);
    return op==='='?cmp===0:op==='<>'?cmp!==0:op==='<'?cmp<0:op==='>'?cmp>0:op==='<='?cmp<=0:cmp>=0;
  }
  function cellValue(sheet,ref,depth){
    if(++referenced>maxReferences)throw Error('수식 셀 참조 연산량 한도를 초과했습니다.');
    const {row,col}=addr(ref),cell=lookups.get(sheet)?.get(row+':'+col);
    return cell?calculate(sheet,cell,depth+1):null;
  }
  function evaluate(node,currentSheet,depth){
    if(depth>maxDepth)throw Error('수식 참조 깊이 한도 초과');
    if(node.kind==='value')return node.value;
    if(node.kind==='percent')return num(evaluate(node.value,currentSheet,depth+1))/100;
    if(node.kind==='unary'){const v=num(evaluate(node.value,currentSheet,depth+1));return node.op==='-'?-v:v;}
    if(node.kind==='cell'){
      const sheet=node.sheet===null?currentSheet:names.get(String(node.sheet).toLowerCase());
      if(!sheet)throw Error('수식 참조 시트가 없습니다: '+node.sheet);
      return cellValue(sheet,node.ref,depth);
    }
    if(node.kind==='range'){
      const sheet=node.sheet===null?currentSheet:names.get(String(node.sheet).toLowerCase());
      if(!sheet)throw Error('수식 참조 시트가 없습니다: '+node.sheet);
      const a=addr(node.from),b=addr(node.to);if(a.row>b.row||a.col>b.col)throw Error('수식 셀 범위가 뒤집혔습니다.');
      if((b.row-a.row+1)*(b.col-a.col+1)>100000)throw Error('단일 수식의 참조 범위가 너무 큽니다.');
      const vals=[];for(let r=a.row;r<=b.row;r++)for(let c=a.col;c<=b.col;c++){
        if(++referenced>maxReferences)throw Error('수식 참조 연산량 한도를 초과했습니다.');
        const cell=lookups.get(sheet)?.get(r+':'+c);vals.push(cell?calculate(sheet,cell,depth+1):null);
      }return vals;
    }
    if(node.kind==='binary'){
      const left=evaluate(node.left,currentSheet,depth+1),right=evaluate(node.right,currentSheet,depth+1),op=node.op;
      if(op==='&')return String(scalar(left))+String(scalar(right));
      if(['=','<>','<','>','<=','>='].includes(op)){const c=compare(scalar(left),scalar(right));return op==='='?c===0:op==='<>'?c!==0:op==='<'?c<0:op==='>'?c>0:op==='<='?c<=0:op==='<='?c<=0:c>=0;}
      const a=num(left),b=num(right);if(op==='+')return numberResult(a+b);if(op==='-')return numberResult(a-b);if(op==='*')return numberResult(a*b);
      if(op==='/'){if(b===0)throw Error('0으로 나눔');return numberResult(a/b);}
      if(op==='^')return numberResult(a**b);
    }
    if(node.kind!=='call')throw Error('수식 계산 항목 오류');
    const fn=node.name,args=node.args;
    const evalArg=n=>evaluate(args[n],currentSheet,depth+1);
    if(fn==='IF'){if(args.length<2||args.length>3)throw Error('IF 인수 오류');return truth(evalArg(0))?evalArg(1):args.length===3?evalArg(2):false;}
    if(fn==='IFERROR'){if(args.length!==2)throw Error('IFERROR 인수 오류');try{return evalArg(0);}catch(_){return evalArg(1);}}
    if(fn==='AND')return args.every((_,i)=>truth(evalArg(i)));
    if(fn==='OR')return args.some((_,i)=>truth(evalArg(i)));
    if(fn==='NOT'){if(args.length!==1)throw Error('NOT 인수 오류');return !truth(evalArg(0));}
    if(['COUNTIF','SUMIF','AVERAGEIF'].includes(fn)){
      if(args.length<2||args.length>3)throw Error(fn+' 인수 오류');
      const items=evalArg(0),needle=evalArg(1),matchesAt=[],src=Array.isArray(items)?items:[items];
      src.forEach((v,i)=>{if(matches(v,needle))matchesAt.push(i);});
      if(fn==='COUNTIF')return matchesAt.length;
      const target=args[2]===undefined?src:evalArg(2),targetItems=Array.isArray(target)?target:[target];
      if(targetItems.length!==src.length)throw Error(fn+' 범위 크기 불일치');
      const numbers=matchesAt.map(i=>targetItems[i]).filter(x=>x!==null&&x!==''&&Number.isFinite(Number(x))).map(Number);
      const total=numbers.reduce((a,b)=>a+b,0);
      return fn==='SUMIF'?numberResult(total):numbers.length?numberResult(total/numbers.length):0;
    }
    const vals=args.map((_,i)=>evalArg(i)).flat(Infinity);
    const numbers=vals.filter(v=>v!==null&&v!==''&&typeof v!=='boolean'&&Number.isFinite(Number(v))).map(Number);
    const value=i=>num(vals[i]??null);
    switch(fn){
      case 'SUM': return numberResult(numbers.reduce((a,b)=>a+b,0));
      case 'AVERAGE': if(!numbers.length)throw Error('AVERAGE 대상 숫자 없음');return numberResult(numbers.reduce((a,b)=>a+b,0)/numbers.length);
      case 'MIN':return numbers.length?Math.min(...numbers):0;
      case 'MAX':return numbers.length?Math.max(...numbers):0;
      case 'COUNT':return numbers.length;
      case 'COUNTA':return vals.filter(v=>v!==null&&v!=='').length;
      case 'ABS':return Math.abs(value(0));
      case 'ROUND':case 'ROUNDUP':case 'ROUNDDOWN':{
        const k=Math.max(-12,Math.min(12,Math.trunc(value(1)))),pow=10**k,n=value(0)*pow;
        const rounded=fn==='ROUND'?Math.sign(n)*Math.round(Math.abs(n)):fn==='ROUNDUP'?Math.sign(n)*Math.ceil(Math.abs(n)):Math.trunc(n);
        return numberResult(rounded/pow);
      }
      case 'INT':return Math.floor(value(0));
      case 'MOD':{const b=value(1);if(!b)throw Error('MOD 0으로 나눔');return numberResult(((value(0)%b)+b)%b);}
      case 'POWER':return numberResult(value(0)**value(1));
      case 'SQRT':return numberResult(Math.sqrt(value(0)));
      case 'LEN':return String(scalar(vals[0]??'')).length;
      case 'CONCAT':case 'CONCATENATE':return vals.map(v=>String(scalar(v))).join('').slice(0,2000);
      default:throw Error('지원하지 않는 Excel 함수: '+fn);
    }
  }
  function calculate(sheet,cell,depth){
    if(cell.formula===null||cell.formula===undefined)return cell.value;
    const prior=state.get(cell);
    if(prior==='done')return cell.value;
    if(prior==='busy')throw Error('수식 순환 참조');
    if(cell.cached){state.set(cell,'done');cached++;return cell.value;}
    state.set(cell,'busy');
    try{
      const result=evaluate(ast(cell.formula),sheet,depth+1);
      if(Array.isArray(result)||result===null||result===undefined)throw Error('수식 결과가 단일 값이 아닙니다.');
      if(typeof result==='number')numberResult(result);
      if(typeof result==='string'&&result.length>2000)throw Error('수식 결과 문자열 길이 초과');
      cell.value=result;cell.formatted=typeof result==='number'?String(result):String(result);
      cell.evaluated=true;recalculated++;state.set(cell,'done');return result;
    }catch(e){
      cell.value=null;cell.formatted='';cell.evaluated=false;unresolved++;state.set(cell,'done');
      if(warnings.length<20)warnings.push(sheet.name+'!'+cell.address+': '+String(e.message||e).slice(0,200));
      return null;
    }
  }
  for(const [sheet,cell] of all)calculate(sheet,cell,0);
  return {total:all.length,cached,recalculated,unresolved,referenced,warnings};
}
const api={evaluateFormulas};root.DocutFormulaEngine=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
