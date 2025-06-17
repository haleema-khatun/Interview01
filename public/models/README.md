# Face-API.js Models

This directory should contain the face-api.js model files for advanced face detection.

## Required Models

Download the following models from the face-api.js repository and place them in this directory:

1. **tiny_face_detector_model-weights_manifest.json**
2. **tiny_face_detector_model-shard1**
3. **face_landmark_68_model-weights_manifest.json**
4. **face_landmark_68_model-shard1**
5. **face_recognition_model-weights_manifest.json**
6. **face_recognition_model-shard1**
7. **face_expression_model-weights_manifest.json**
8. **face_expression_model-shard1**
9. **ssd_mobilenetv1_model-weights_manifest.json**
10. **ssd_mobilenetv1_model-shard1**
11. **ssd_mobilenetv1_model-shard2**

## Download Instructions

1. Visit: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download all the required model files
3. Place them in this `/public/models/` directory

## Alternative: CDN Loading

If you prefer not to host the models locally, the component will automatically fall back to MediaPipe face detection, which loads models from CDN.

## Model Sizes

- Total size: ~6MB
- Models are loaded asynchronously for better performance
- Fallback to MediaPipe if models fail to load