import { installTF } from '../utils/deps';
installTF();
import { GaussianNB } from './gaussian';
import { MultinomialNB } from './multinomial';

export { GaussianNB, MultinomialNB };
