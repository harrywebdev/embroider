'use strict';

const Filter = require('broccoli-persistent-filter');
const funnel = require('broccoli-funnel');
const path = require('path');

class Awk extends Filter {
  constructor(inputNode, searchReplaceObj) {
    super(inputNode, {});
    this.searchReplaceObj = searchReplaceObj;
  }

  processString(content) {
    let modifiedContent = content;

    Object.entries(this.searchReplaceObj).forEach(([search, replace]) => {
      modifiedContent = modifiedContent.replace(search, replace);
    });

    return modifiedContent;
  }
}

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    registry.add('css', {
      name: this.name,
      ext: 'css',
      toTree: (tree, inputPath, outputPath) => {
        console.log('inputPath: ' + inputPath);
        return funnel(new Awk(tree, { '%%%': inputPath === '/app/styles' ? 'red' : 'blue' }), {
          getDestinationPath(relativePath) {
            let relativePathWithPrefix = `/${relativePath}`;
            console.log('relativePath: ' + relativePath);
            console.log('relativePathWithPrefix: ' + relativePathWithPrefix);

            if (relativePathWithPrefix === `${inputPath}/app.css`) {
              return path.join(outputPath, 'app-template.css');
            }

            return path.join(outputPath, relativePathWithPrefix.replace(inputPath, ''));
          },
        });
      },
    });
  },
};
