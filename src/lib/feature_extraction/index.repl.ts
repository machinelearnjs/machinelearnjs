import * as natural from 'natural';
var tokenizer = new natural.WordTokenizer();
console.log(tokenizer.tokenize("your do a dog dog has fleas."));

var NGrams = natural.NGrams;
console.log(NGrams.ngrams('This is a text document to analyze.', 5));

import { CountVectorizer } from "./text";

const cv = new CountVectorizer();

const text1 = ['deep learning ian good fellow learning jason shin shin', 'yoshua bengio'];

cv.fit(text1);
