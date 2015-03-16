module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        reporters: ['progress'],
        basePath: '',
        files: [
            {pattern: 'test/fixtures/*.html', watched: false, included: false, served: true},
            'bower_components/jquery/dist/jquery.js',
            'bower_components/stapes/stapes.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'dist/stapes-ui.js',
            'test/test.conf.js',
            'test/*.spec.js'
        ],
        preprocessors: {
            '**/*.html': []
        }
    });
};
