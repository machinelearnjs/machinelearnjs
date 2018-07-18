/* tslint:disable */
import { CountVectorizer } from './text';

const cv = new CountVectorizer();

const text1 = ['deep learning ian good fellow learning jason shin shin', 'yoshua bengio'];
const vocabCounts = cv.fit_transform(text1);
console.log(vocabCounts);
console.log(cv.vocabulary);
console.log(cv.getFeatureNames());

const newVocabCounts = cv.transform(['ian good fellow jason duuog']);
console.log(newVocabCounts);
