"""Synthetic tests validate the scoring tool, NOT any corporate report fidelity."""
import sys
import unittest
from pathlib import Path
import numpy as np
import cv2
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from visual_fidelity_score import compare

class FidelityMetricTests(unittest.TestCase):
    def setUp(self):
        a=np.full((180,320,3),248,dtype=np.uint8)
        cv2.rectangle(a,(18,18),(260,45),(150,45,49),-1)
        cv2.circle(a,(130,112),46,(195,160,139),-1)
        cv2.rectangle(a,(220,80),(286,151),(60,60,60),2)
        self.a=a
    def test_identical(self):
        score=compare(self.a,self.a.copy(),{'rects':[],'benchmark':'independent_original'})
        self.assertGreaterEqual(score['score'],99.99)
        self.assertTrue(score['passed99'])
    def test_filled_white_cannot_pass(self):
        blank=np.full_like(self.a,248)
        score=compare(self.a,blank,{'rects':[],'benchmark':'independent_original'})
        self.assertFalse(score['passed99']);self.assertLess(score['components']['edges'],50)
    def test_wrong_ratio_rejected(self):
        with self.assertRaisesRegex(ValueError,'Canvas dimensions'):
            compare(self.a,self.a[:,:200],{'rects':[],'benchmark':'independent_original'})
    def test_mask_abuse_rejected(self):
        with self.assertRaisesRegex(ValueError,'35%'):
            compare(self.a,self.a,{'rects':[{'x':0,'y':0,'w':300,'h':150,'role':'text'}],'benchmark':'independent_original'})
    def test_mask_cannot_hide_shape(self):
        with self.assertRaisesRegex(ValueError,'text/number/logo'):
            compare(self.a,self.a,{'rects':[{'x':1,'y':1,'w':150,'h':20,'role':'chart'}],'benchmark':'independent_original'})

if __name__=='__main__':unittest.main()
