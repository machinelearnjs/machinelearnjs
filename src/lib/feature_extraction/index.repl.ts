import * as natural from 'natural';
const tokenizer = new natural.WordTokenizer();
console.log(tokenizer.tokenize("your do a dog dog has fleas."));

const NGrams = natural.NGrams;
console.log(NGrams.ngrams('This is a text document to analyze.', 5));

import { CountVectorizer } from "./text";

//
const cv = new CountVectorizer();

const text1 = ['deep learning ian good fellow learning jason shin shin', 'yoshua bengio'];

console.log('original text', text1);
const vocabCounts = cv.fit_transform(text1);
console.log(vocabCounts);
console.log(cv.vocabulary_);
console.log(cv.getFeatureNames());

const newVocabCounts = cv.transform(['ian good fellow jason duuog']);
console.log('new one', newVocabCounts);