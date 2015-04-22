module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        reporters: ['progress'],
        basePath: '',
        files: [
            //{pattern: 'test/fixtures/*.html', watched: false, included: false, served: true},
            'test/fixtures/*.html',
            'bower_components/stapes/stapes.js',
            'dist/stapes-ui.js',
            'test/test.conf.js',
            'test/*.spec.js'
        ],
        preprocessors: {
            //'**/*.html': []
            'test/fixtures/*.html': ['html2js']
        }
    });
};
