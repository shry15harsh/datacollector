/**
 * Service for providing access to the backend API via HTTP.
 */

angular.module('dataCollectorApp.common')
  .factory('api', function($rootScope, $http, $q) {
    var apiVersion = 'v1',
      apiBase = '/rest/' + apiVersion,
      api = {
        apiVersion: apiVersion,
        events: {}
      };

    api.log = {
      /**
       * Fetch current log
       *
       * @param endingOffset
       */
      getCurrentLog: function(endingOffset) {
        var url = apiBase + '/log?endingOffset=' +  (endingOffset ? endingOffset : '-1');
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetch list of Log file names
       *
       * @returns {*}
       */
      getFilesList: function() {
        var url = apiBase + '/log/files';
        return $http({
          method: 'GET',
          url: url
        });
      }
    };

    api.admin = {

      /**
       * Fetch Help IDs
       */
      getHelpRef: function() {
        var url = apiBase + '/helpref';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetches JVM Metrics
       * @returns {*}
       */
      getJMX : function() {
        var url = '/jmx';
        return $http({
          method: 'GET',
          url: url
        });
      },


      /**
       * Fetches JVM Thread Dump
       */
      getThreadDump: function() {
        var url = apiBase + '/admin/threadsDump';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetched User Information
       */
      getUserInfo: function() {
        var url = apiBase + '/info/user';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetched Build Information
       */
      getBuildInfo: function() {
        var url = apiBase + '/info/sdc';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Shutdown the Data Collector.
       * @returns {*}
       */
      shutdownCollector: function() {
        var url = apiBase + '/admin/shutdown';
        return $http({
          method: 'POST',
          url: url
        });
      },

      /**
       * logout
       */
      logout: function() {
        var url = apiBase + '/authentication/logout';
        return $http({
          method: 'POST',
          url: url
        });
      },

      /**
       * Returns SDC Directories
       * @returns {*}
       */
      getSDCDirectories: function() {
        var url = apiBase + '/admin/sdcDirectories';
        return $http({
          method: 'GET',
          url: url
        });
      }

    };

    api.pipelineAgent = {
      /**
       * Fetches Configuration from dist/src/main/etc/pipeline.properties
       *
       * @returns {*}
       */
      getConfiguration: function() {
        var url = apiBase + '/configuration/all';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetches all configuration definitions of Pipeline and Stage Configuration.
       *
       * @returns {*}
       */
      getDefinitions: function() {
        var url = apiBase + '/definitions';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetches all Pipeline Configuration Info.
       *
       * @returns {*}
       */
      getPipelines: function() {
        var url = apiBase + '/pipeline-library';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetches Pipeline Configuration.
       *
       * @param name
       * @returns {*}
       */
      getPipelineConfig: function(name) {
        var url;

        if(!name) {
          name = 'xyz';
        }

        url = apiBase + '/pipeline-library/' + name;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetches Pipeline Configuration Information
       *
       * @param name
       * @returns {*}
       */
      getPipelineConfigInfo: function(name) {
        var url;

        if(!name) {
          name = 'xyz';
        }

        url = apiBase + '/pipeline-library/' + name + '?get=info';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Sends updated Pipeline configuration to server for update.
       *
       * @param name - Pipeline Name
       * @param config - Modified Pipeline Configuration
       * @returns Updated Pipeline Configuration
       */
      savePipelineConfig: function(name, config) {
        var url;

        if(!name) {
          name = 'xyz';
        }

        url = apiBase + '/pipeline-library/' + name;
        return $http({
          method: 'POST',
          url: url,
          data: config
        });
      },

      /**
       * Create new Pipeline Configuration.
       *
       * @param name
       * @param description
       */
      createNewPipelineConfig: function(name, description) {
        var url = apiBase + '/pipeline-library/' + name + '?description=' + description;

        return $http({
          method: 'PUT',
          url: url
        });
      },

      /**
       * Delete Pipeline Cofiguration.
       *
       * @param name
       * @returns {*}
       */
      deletePipelineConfig: function(name) {
        var url = apiBase + '/pipeline-library/' + name;

        return $http({
          method: 'DELETE',
          url: url
        });
      },


      duplicatePipelineConfig: function(name, description, pipelineInfo) {
        var deferred = $q.defer(),
          pipelineObject,
          pipelineRulesObject,
          duplicatePipelineObject,
          duplicatePipelineRulesObject;

        // Fetch the pipelineInfo full object
        // then Create new config object
        // then copy the configuration from pipelineInfo to new Object.
        $q.all([api.pipelineAgent.getPipelineConfig(pipelineInfo.name), api.pipelineAgent.getPipelineRules(pipelineInfo.name)])
          .then(function(results) {
            pipelineObject = results[0].data;
            pipelineRulesObject = results[1].data;
            return api.pipelineAgent.createNewPipelineConfig(name, description);
          })
          .then(function(res) {
            duplicatePipelineObject = res.data;
            duplicatePipelineObject.configuration = pipelineObject.configuration;
            duplicatePipelineObject.uiInfo = pipelineObject.uiInfo;
            duplicatePipelineObject.errorStage = pipelineObject.errorStage;
            duplicatePipelineObject.stages = pipelineObject.stages;
            return api.pipelineAgent.savePipelineConfig(name, duplicatePipelineObject);
          })
          .then(function(res) {
            duplicatePipelineObject = res.data;

            //Fetch the Pipeline Rules
            return api.pipelineAgent.getPipelineRules(name);
          })
          .then(function(res) {
            duplicatePipelineRulesObject = res.data;
            duplicatePipelineRulesObject.metricsRuleDefinitions = pipelineRulesObject.metricsRuleDefinitions;
            duplicatePipelineRulesObject.dataRuleDefinitions = pipelineRulesObject.dataRuleDefinitions;
            duplicatePipelineRulesObject.emailIds = pipelineRulesObject.emailIds;

            //Save the pipeline Rules
            return api.pipelineAgent.savePipelineRules(name, duplicatePipelineRulesObject);
          })
          .then(function(res) {
            deferred.resolve(duplicatePipelineObject);
          },function(res) {
            deferred.reject(res);
          });

        return deferred.promise;
      },


      /**
       * Export Pipeline Configuration.
       *
       * @param name
       */
      exportPipelineConfig: function(name) {
        var url;

        if(!name) {
          name = 'xyz';
        }

        url = apiBase + '/pipeline-library/' + name + '?attachment=true';

        window.open(url, '_blank', '');
      },

      /**
       * Start Preview for given Pipeline name
       *
       * @param name
       * @param sourceOffset
       * @param batchSize
       * @param rev
       * @param skipTargets
       * @param stageOutputList
       * @param endStage
       * @returns {*}
       */
      createPreview: function(name, sourceOffset, batchSize, rev, skipTargets, stageOutputList, endStage) {
        var url;

        if(!batchSize) {
          batchSize = 10;
        }

        url = apiBase + '/preview/' + name + '/create?batchSize=' + batchSize + '&rev=' + rev +
            '&skipTargets=' + skipTargets;

        if(endStage) {
          url += '&endStage=' + endStage;
        }

        return $http({
          method: 'POST',
          url: url,
          data: stageOutputList || []
        });
      },


      /**
       * Fetches Preview Status
       *
       * @param previewerId
       */
      getPreviewStatus: function(previewerId) {
        var url = apiBase + '/preview-id/' + previewerId + '/status' ;
        return $http({
          method: 'GET',
          url: url
        });
      },


      /**
       * Fetches Preview Data
       *
       * @param previewerId
       */
      getPreviewData: function(previewerId) {
        var url = apiBase + '/preview-id/' + previewerId;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Stop Preview
       *
       * @param previewerId
       */
      cancelPreview: function(previewerId) {
        var url = apiBase + '/preview-id/' + previewerId + '/cancel' ;
        return $http({
          method: 'POST',
          url: url
        });
      },

      /**
       * Fetch all Pipeline Status
       *
       * @returns {*}
       */
      getAllPipelineStatus: function() {
        var url = apiBase + '/pipelines/status';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Fetch the Pipeline Status
       *
       * @returns {*}
       */
      getPipelineStatus: function(pipelineName, rev) {
        var url = apiBase + '/pipeline/' + pipelineName + '/status?rev=' + rev;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Validate the Pipeline
       *
       * @param name
       * @returns {*}
       */
      validatePipeline: function(name) {
        var url = apiBase + '/pipeline/' + name + '/validate';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Start the Pipeline
       *
       * @param pipelineName
       * @param rev
       * @returns {*}
       */
      startPipeline: function(pipelineName, rev) {
        var url = apiBase + '/pipeline/' + pipelineName + '/start?rev=' + rev ;
        return $http({
          method: 'POST',
          url: url
        });
      },

      /**
       * Stop the Pipeline
       *
       * @returns {*}
       */
      stopPipeline: function(pipelineName, rev) {
        var url = apiBase + '/pipeline/' + pipelineName + '/stop?rev=' + rev ;
        return $http({
          method: 'POST',
          url: url
        });
      },

      /**
       * Fetch the Pipeline Metrics
       *
       * @returns {*}
       */
      getPipelineMetrics: function(pipelineName, rev) {
        var url = apiBase + '/pipeline/' + pipelineName + '/metrics?rev=' + rev ;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Get List of available snapshots.
       *
       * @returns {*}
       */
      getSnapshotsInfo: function() {
        var url = apiBase + '/pipelines/snapshots' ;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Capture Snapshot of running pipeline.
       *
       * @param pipelineName
       * @param rev
       * @param snapshotName
       * @param batchSize
       * @returns {*}
       */
      captureSnapshot: function(pipelineName, rev, snapshotName, batchSize) {
        var url = apiBase + '/pipeline/' + pipelineName + '/snapshot/' + snapshotName +
          '?batchSize=' + batchSize + '&rev=' + rev;
        return $http({
          method: 'PUT',
          url: url
        });
      },

      /**
       * Get Status of Snapshot.
       *
       * @param pipelineName
       * @param rev
       * @param snapshotName
       * @returns {*}
       */
      getSnapshotStatus: function(pipelineName, rev, snapshotName) {
        var url = apiBase + '/pipeline/' + pipelineName + '/snapshot/' + snapshotName + '/status?rev=' + rev;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Get captured snapshot for given pipeline name.
       *
       * @param pipelineName
       * @param rev
       * @param snapshotName
       * @returns {*}
       */
      getSnapshot: function(pipelineName, rev, snapshotName) {
        var url = apiBase + '/pipeline/' + pipelineName + '/snapshot/' + snapshotName + '?rev=' + rev;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Delete captured snapshot for given pipeline name.
       *
       * @param pipelineName
       * @param rev
       * @param snapshotName
       * @returns {*}
       */
      deleteSnapshot: function(pipelineName, rev, snapshotName) {
        var url = apiBase + '/pipeline/' + pipelineName + '/snapshot/' + snapshotName + '?rev=' + rev;
        return $http({
          method: 'DELETE',
          url: url
        });
      },

      /**
       * Get error records for the given stage instance name of running pipeline if it is provided otherwise
       * return error records for the pipeline.
       *
       * @param pipelineName
       * @param rev
       * @param stageInstanceName
       * @returns {*}
       */
      getErrorRecords: function(pipelineName, rev, stageInstanceName) {
        var url = apiBase + '/pipeline/' + pipelineName + '/errorRecords?rev=' + rev +
          '&stageInstanceName=' + stageInstanceName;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Get error messages for the given stage instance name of running pipeline if is provided otherwise
       * return error messages for the pipeline.
       *
       * @param pipelineName
       * @param rev
       * @param stageInstanceName
       * @returns {*}
       */
      getErrorMessages: function(pipelineName, rev, stageInstanceName) {
        var url = apiBase + '/pipeline/' + pipelineName + '/errorMessages?rev=' + rev +
          '&stageInstanceName=' + stageInstanceName;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Raw Source Preview
       *
       * @param name
       * @param rev
       * @param configurations
       * @returns {*}
       */
      rawSourcePreview: function(name, rev, configurations) {
        var url = apiBase + '/preview/' + name + '/rawSourcePreview?rev=' + rev;

        angular.forEach(configurations, function(config) {
          if(config.name && config.value !== undefined) {
            url+= '&' + config.name + '=' + config.value;
          }
        });

        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Get history of the pipeline
       *
       * @param name
       * @param rev
       * @returns {*}
       */
      getHistory: function(name, rev) {
        var url = apiBase + '/pipeline/' + name + '/history';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Reset Offset for Pipeline
       *
       * @param name
       */
      resetOffset: function(name) {
        var url = apiBase + '/pipeline/' + name + '/resetOffset';
        return $http({
          method: 'POST',
          url: url
        });
      },

      /**
       * Fetches Pipeline Rules.
       *
       * @param name
       * @returns {*}
       */
      getPipelineRules: function(name) {
        var url;

        url = apiBase + '/pipeline-library/' + name + '/rules';
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Sends updated Pipeline rules to server for update.
       *
       * @param name - Pipeline Name
       * @param rules - Modified Pipeline Configuration
       * @returns Updated Pipeline Rules
       */
      savePipelineRules: function(name, rules) {
        var url = apiBase + '/pipeline-library/' + name + '/rules';
        return $http({
          method: 'POST',
          url: url,
          data: rules
        });
      },


      /**
       * Get Sampled data for given sampling rule id.
       *
       * @param pipelineName
       * @param samplingRuleId
       * @returns {*}
       */
      getSampledRecords: function(pipelineName, samplingRuleId) {
        var url = apiBase + '/pipeline/' + pipelineName + '/sampledRecords?sampleId=' + samplingRuleId ;
        return $http({
          method: 'GET',
          url: url
        });
      },

      /**
       * Delete Alert
       *
       * @param name
       * @param ruleId
       * @returns {*}
       */
      deleteAlert: function(name, ruleId) {
        var url = apiBase + '/pipeline/' + name + '/alerts?alertId=' + ruleId;

        return $http({
          method: 'DELETE',
          url: url
        });
      }
    };


    api.timeSeries = {
      /**
       * Fetch Time Series Data
       *
       * @param query
       */
      getTimeSeriesData: function(query) {
        var url = apiBase + '/pipeline/metrics/timeSeries?q=' +  query;
        return $http({
          method: 'GET',
          url: url
        });
      }
    };

    return api;
  });