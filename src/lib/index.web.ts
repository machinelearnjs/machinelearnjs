import * as cluster from './cluster';
import * as decomposition from './decomposition';
import * as ensemble from './ensemble';
import * as feature_extraction from './feature_extraction';
import * as linear_model from './linear_model';
import * as metrics from './metrics';
import * as model_selection from './model_selection';
import * as neighbors from './neighbors';
import * as preprocessing from './preprocessing';
import * as tree from './tree';

// NOTE: For the browser bundling, we will temporarily ignore datasets and SVM API due to a few issues.
// These APIs won't be available for the browsers until there is a patch.

// @ts-ignore: ml module binding on window
window.ml = {
  cluster,
  decomposition,
  ensemble,
  feature_extraction,
  linear_model,
  metrics,
  model_selection,
  neighbors,
  preprocessing,
  tree,
};
