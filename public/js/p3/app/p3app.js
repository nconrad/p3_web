define([
  'dojo/_base/declare',
  'dojo/topic', 'dojo/on', 'dojo/dom', 'dojo/dom-class', 'dojo/dom-attr', 'dojo/dom-construct', 'dojo/query',
  'dijit/registry', 'dojo/_base/lang',
  'dojo/_base/Deferred',
  'dojo/store/JsonRest', 'dojox/widget/Toaster',
  'dojo/ready', './app', '../router',
  'dojo/window', '../widget/Drawer', 'dijit/layout/ContentPane',
  '../jsonrpc', '../panels', '../WorkspaceManager', '../DataAPI', 'dojo/keys',
  'dijit/Dialog', '../util/PathJoin', 'dojo/request', '../widget/WorkspaceController'
], function (
  declare,
  Topic, on, dom, domClass, domAttr, domConstruct, domQuery,
  Registry, lang,
  Deferred,
  JsonRest, Toaster,
  Ready, App,
  Router, Window,
  Drawer, ContentPane,
  RPC, Panels, WorkspaceManager, DataAPI, Keys,
  Dialog, PathJoin, xhr, WorkspaceController
) {
  return declare([App], {
    panels: Panels,
    activeWorkspace: null,
    activeWorkspacePath: '/',
    uploadInProgress: false,
    activeMouse: false,
    alreadyLoggedIn: false,
    authorizationToken: null,
    user: '',
    startup: function () {
      var _self = this;
      this.checkLogin();

      on(document.body, 'keypress', function (evt) {
        var charOrCode = evt.charCode || evt.keyCode;

        if ((charOrCode === 4) && evt.ctrlKey && evt.shiftKey) {
          if (!this._devDlg) {
            this._devDlg = new Dialog({
              title: 'Debugging Panel',
              content: '<div data-dojo-type="p3/widget/DeveloperPanel" style="width:250px;height:450px"></div>'
            });
          }

          if (this._devDlg.open) {
            this._devDlg.hide();
          } else {
            this._devDlg.show();
          }
        }

        console.log('window.App.activemouse', window.App.activeMouse);
      });

      var onDocumentTitleChanged = function () {
        // var meta = document.getElementsByTagName("meta[name='Keyword']");
        var meta = domQuery("meta[name='Keywords']")[0];
        if (meta) {
          meta.content = 'PATRIC,' + (document.title).replace('::', ',');
        }
        if (window.gtag) {
          // console.log("document title changed to", document.title);
          var pagePath = window.location.pathname + window.location.hash;
          gtag('config', window.App.gaID, { 'page_path': pagePath });
        }
      };

      // listening document.title change event
      var titleEl = document.getElementsByTagName('title')[0];
      var docEl = document.documentElement;

      if (docEl && docEl.addEventListener) {
        docEl.addEventListener('DOMSubtreeModified', function (evt) {
          var t = evt.target;
          if (t === titleEl || (t.parentNode && t.parentNode === titleEl)) {
            onDocumentTitleChanged();
          }
        }, false);
      } else {
        document.onpropertychange = function () {
          if (window.event.propertyName === 'title') {
            onDocumentTitleChanged();
          }
        };
      }

      function getState(params, path) {
        var parser = document.createElement('a');
        parser.href = path;

        var newState = params.state || {};

        newState.href = path;
        newState.prev = params.oldPath;

        if (newState.search) {
          // pass
        } else if (parser.search) {
          newState.search = (parser.search.charAt(0) === '?') ? parser.search.substr(1) : parser.search;
        } else {
          newState.search = '';
        }

        newState.hash = parser.hash;
        newState.pathname = parser.pathname;

        if (newState.hash) {
          newState.hash = (newState.hash.charAt(0) === '#') ? newState.hash.substr(1) : newState.hash;
          newState.hashParams = newState.hashParams || {};

          var hps = newState.hash.split('&');
          hps.forEach(function (t) {
            var tup = t.split('=');
            if (tup[0] && tup[1]) {
              newState.hashParams[tup[0]] = tup[1];
            }
          });
        }
        return newState;
      }

      function populateState(params) {
        var newState = { href: params.newPath };
        for (var prop in params.state) {
          // guard-for-in
          if (Object.prototype.hasOwnProperty.call(params.state, prop)) {
            newState[prop] = params.state[prop];
          }
        }
        return newState;
      }

      Router.register('/$', function (params, oldPath, newPath, state) {
        var homeNode = dom.byId('patric-homepage');
        if (homeNode) {
          return;
        }
        window.location.reload();
      });

      Router.register('/remote', function (params, oldPath, newPath, state) {
        console.log('REMOTE WINDOW, WAIT FOR /navigate message');
        window.postMessage('RemoteReady', '*');
      });

      Router.register('/job(/.*)', function (params, oldPath, newPath, state) {
        var newState = populateState(params);

        var path = params.params[0] || '/';
        newState.widgetClass = 'p3/widget/JobManager';
        newState.value = path;
        newState.set = 'path';
        newState.requireAuth = true;
        newState.pageTitle = 'PATRIC Jobs';

        _self.navigate(newState);
      });

      Router.register('/search/(.*)', function (params, oldPath, newPath, state) {
        var newState = getState(params, oldPath);
        newState.widgetClass = 'p3/widget/AdvancedSearch';
        newState.requireAuth = false;
        _self.navigate(newState);
      });

      Router.register('/uploads(/.*)', function (params, oldPath, newPath, state) {
        var newState = populateState(params);

        var path = params.params[0] || '/';
        newState.widgetClass = 'p3/widget/UploadManager';
        newState.value = path;
        newState.set = 'path';
        newState.requireAuth = true;
        // console.log("Navigate to ", newState);
        _self.navigate(newState);
      });

      Router.register('/content(/.*)', function (params, oldPath, newPath, state) {
        var newState = populateState(params);

        var path = params.params[0] || '/';
        newState.widgetClass = 'dijit/layout/ContentPane';
        newState.style = 'padding:0';
        newState.value = PathJoin(_self.dataAPI, 'content', path);
        newState.set = 'href';
        newState.requireAuth = false;
        newState.pageTitle = 'PATRIC';
        // console.log("Navigate to ", newState);
        _self.navigate(newState);
      });

      Router.register('/webpage(/.*)', function (params, oldPath, newPath, state) {

        var path = params.params[0] || '/';
        var newState = getState(params, oldPath);
        newState.widgetClass = 'p3/widget/WebPagePane';
        newState.widgetExtraClass = 'webpage';
        newState.value = PathJoin(_self.docsServiceURL, path);
        newState.set = 'href';
        newState.requireAuth = false;

        _self.navigate(newState);
      });

      Router.register('/user(/.*)', function (params, oldPath, newPath, state) {
        var path = params.params[0] || '/';
        var newState = getState(params, oldPath);
        newState.widgetClass = 'p3/widget/UserDetails';
        newState.widgetExtraClass = 'user';
        newState.value = PathJoin(_self.docsServiceURL, path);
        newState.set = 'href';
        newState.requireAuth = true;
        _self.navigate(newState);
      });

      Router.register('/sulogin', function (params, oldPath, newPath, state) {
        var path = params.params[0] || '/';
        var newState = getState(params, oldPath);
        newState.widgetClass = 'p3/widget/SuLogin';
        newState.widgetExtraClass = 'sulogin';
        newState.value = PathJoin(_self.docsServiceURL, path);
        newState.set = 'href';
        newState.requireAuth = true;
        _self.navigate(newState);
      });

      Router.register('/help(/.*)', function (params, oldPath, newPath, state) {
        var newState = populateState(params);

        var path = params.params[0] || '/';
        newState.widgetClass = 'dijit/layout/ContentPane';
        newState.style = 'padding:0';
        newState.value = /* _self.dataAPI +*/ '/public/help/' + path;
        newState.set = 'href';
        newState.requireAuth = false;
        newState.pageTitle = 'PATRIC';

        _self.navigate(newState);
      });


      Router.register('/workspace(/.*)', function (params, oldPath, newPath, state) {
        var newState = populateState(params);

        var path = params.params[0] || ('/' + _self.user.id ); //  + "/home/")
        var parts = path.split('/');

        if (path.replace(/\/+/g, '') === 'public') {
          path = '/public/';
        } else if (parts.length < 3) {
          path = ('/' + _self.user.id );  // + "/home/"
        }

        newState.widgetClass = 'p3/widget/WorkspaceManager';
        newState.value = path;
        newState.set = 'path';
        newState.requireAuth = false;
        newState.pageTitle = 'PATRIC Workspace';
        _self.navigate(newState);
      });

      Router.register('/view(/.*)', function (params, path) {
        var newState = getState(params, path);
        var parts = newState.pathname.split('/');
        parts.shift();
        var type = parts.shift();

        newState.widgetClass = 'p3/widget/viewer/' + type;

        _self.navigate(newState);
      });

      Router.register('/status', function (params, path) {
        var newState = populateState(params);


        var path = params.params[0] || '/';
        newState.widgetClass = 'p3/widget/viewer/SystemStatus';
        newState.value = path;
        newState.set = 'path';
        newState.requireAuth = false;
        newState.pageTitle = 'System Status';

        _self.navigate(newState);
      });


      Router.register('/app(/.*)', function (params, path) {
        // console.log("view URL Callback", arguments);

        var parts = path.split('/');
        parts.shift();
        var type = parts.shift();
        var viewerParams;

        if (parts.length > 0) {
          viewerParams = parts.join('/');
        } else {
          viewerParams = '';
        }

        var newState = populateState(params);

        newState.widgetClass = 'p3/widget/app/' + type;
        newState.value = viewerParams;
        newState.set = 'params';

        // move requireAuth check to AppBase and its derieved class
        newState.requireAuth = false;

        _self.navigate(newState);
      });

      if (!this.api) {
        this.api = {};
      }

      if (this.workspaceAPI) {
        WorkspaceManager.init(this.workspaceAPI, this.authorizationToken || '', this.user ? this.user.id : '');
        this.api.workspace = RPC(this.workspaceAPI, this.authorizationToken || '');
      }

      if (this.serviceAPI) {
        this.api.service = RPC(this.serviceAPI, this.authorizationToken || '');
      }

      if (this.dataAPI) {

        if (this.dataAPI.charAt(-1) !== '/') {
          this.dataAPI = this.dataAPI + '/';
        }
        DataAPI.init(this.dataAPI, this.authorizationToken || '');
        this.api.data = RPC(this.dataAPI, this.authorizationToken);
      }

      this.toaster = new Toaster({ positionDirection: 'bl-up', messageTopic: '/Notification', duration: 3000 });

      if (this.user && this.user.id) {
        domAttr.set('YourWorkspaceLink', 'href', '/workspace/' + this.user.id);
        var n = dom.byId('signedInAs');

        if (n) {
          n.innerHTML = this.user.id.replace('@patricbrc.org', '');
        }
      }

      Topic.subscribe('/userWorkspaces', lang.hitch(this, 'updateUserWorkspaceList'));
      Topic.subscribe('/userWorkspaces', lang.hitch(this, 'updateMyDataSection'));

      // update "My Data" > "Completed Jobs" count on homepage
      this.api.service('AppService.query_task_summary', []).then(function (status) {
        var node = dom.byId('MyDataJobs');
        if (node) {
          node.innerHTML = status[0].completed + ' Completed Jobs';
        }
      });

      this.inherited(arguments);
      this.timeout();
    },

    timeout: function () {
      setTimeout(function () {
        // check if logged out and another tab is open
        if (!localStorage.getItem('tokenstring')) {
          if (document.getElementsByClassName('Authenticated').length > 0) {
            document.body.className = document.body.className.replace('Authenticated', '');
            // console.log("Redirect");
            window.location.assign('/');
          }
        } else {
          // check if token has expired
          window.App.checkLogin();
        }
        window.App.timeout();
      }, window.App.localStorageCheckInterval);
    },
    checkLogin: function () {
      var tokenstring = localStorage.getItem('tokenstring');
      if (!tokenstring) {
        return;
      }

      var auth = JSON.parse(localStorage.getItem('auth'));

      var validToken = this.isTokenValid(auth.expiry);
      if (auth && auth.expiry && validToken && window.App.alreadyLoggedIn) {
        return;
      }

      if (validToken) {
        document.body.classList.add('Authenticated');

        window.App.user = JSON.parse(localStorage.getItem('userProfile'));
        window.App.authorizationToken = tokenstring;

        // show the upload and jobs widget
        window.App.uploadJobsWidget('show');
        window.App.checkSU();
        window.App.alreadyLoggedIn = true;
      } else {
        // if mouse has moved in past x minutes then refresh the token
        // or if upload is in progress then refresh the token
        // console.log('I am uploading a file');
        // console.log('upload in progress', window.App.uploadInProgress);
        // console.log('activeMouse', window.App.activeMouse);
        if (window.App.activeMouse || window.App.uploadInProgress) {
          console.log('going to refresh the token now');
          var userServiceURL = window.App.userServiceURL;
          userServiceURL.replace(/\/+$/, '');
          xhr.get(userServiceURL + '/authenticate/refresh/', {
            headers: {
              'Accept': 'application/json',
              'Authorization': window.App.authorizationToken
            }
          }).then(
            function (data) {
              localStorage.setItem('tokenstring', data);
              window.App.authorizationToken = data;
              var dataArr = data.split('|');
              var keyValueArr = [];
              var dataobj = {};
              for (var i = 0; i < dataArr.length; i++) {
                keyValueArr = dataArr[i].split('=');
                dataobj[keyValueArr[0]] = keyValueArr[1];
              }
              localStorage.setItem('auth', JSON.stringify(dataobj));
              window.App.checkLogin();
            },

            function (err) {
              console.error(err);
            }
          );
        } else {
          console.error('logging you out now, sorry');
          window.App.logout();
        }
      }

    },
    checkSU: function () {
      var suLink = document.getElementsByClassName('sulogin');
      var sbLink = document.getElementsByClassName('suSwitchBack');
      var auth = localStorage.getItem('auth');
      var Aauth = localStorage.getItem('Aauth');
      auth = JSON.parse(auth);
      Aauth = JSON.parse(Aauth);
      if (auth && auth.roles) {
        if (auth.roles.includes('admin')) {
          suLink[0].style.display = 'block';
        } else {
          suLink[0].style.display = 'none';
        }
      } else {
        suLink[0].style.display = 'none';
      }
      // condition for suSwitchBack button
      if (Aauth && Aauth.roles) {
        if (Aauth.roles.includes('admin')) {
          sbLink[0].style.display = 'block';
          var loginBtn = document.querySelector('.login-btn');
          loginBtn.classList.remove('icon-user');
          loginBtn.classList.add('icon-superpowers', 'warning');
        } else {
          sbLink[0].style.display = 'none';
        }
      } else {
        sbLink[0].style.display = 'none';
      }
    },
    suSwitchBack: function () {
      console.log('I clicked the switch back button');
      localStorage.setItem('auth', localStorage.getItem('Aauth'));
      localStorage.setItem('tokenstring', localStorage.getItem('Atokenstring'));
      localStorage.setItem('userProfile', localStorage.getItem('AuserProfile'));
      localStorage.setItem('userid', localStorage.getItem('Auserid'));
      localStorage.removeItem('Aauth');
      localStorage.removeItem('Atokenstring');
      localStorage.removeItem('AuserProfile');
      localStorage.removeItem('Auserid');
      window.App.authorizationToken = localStorage.getItem('tokenstring');
      window.App.user = JSON.parse(localStorage.getItem('userProfile'));
      window.location.href = '/';
    },
    isTokenValid: function (date) {
      var d = new Date();
      var checkd = d.valueOf() / 1000;

      if (checkd > date) {
        console.error('expired token');
        return false;
      }
      return true;
    },
    login: function (data, token) {
      if (!data || !token) {
        return;
      }

      localStorage.setItem('auth', JSON.stringify(data));
      localStorage.setItem('tokenstring', token);

      var userid = data.un.replace('@patricbrc.org', '');
      localStorage.setItem('userid', userid);
      var userServiceURL = window.App.userServiceURL;
      userServiceURL.replace(/\/+$/, '');
      xhr.get(userServiceURL + '/user/' + userid, {
        headers: {
          'Accept': 'application/json',
          'Authorization': token
        }
      }).then(function (user) {
        var userObj = JSON.parse(user);
        userObj.id += '@patricbrc.org';
        user = JSON.stringify(userObj);
        localStorage.removeItem('userProfile');
        localStorage.setItem('userProfile', user);
        window.location.reload();
      }, function (err) {
        console.error(err);
      });
    },
    uploadJobsWidget: function (action) {
      if (action === 'show') {
        // console.log('I want to see the upload and jobs widget');
        var wsc = new WorkspaceController({ region: 'bottom' });
        var ac = this.getApplicationContainer();
        // console.log(ac);
        var uploadBar = ac.domNode.getElementsByClassName('WorkspaceController');
        if (uploadBar.length === 0) {
          ac.addChild(wsc);
        }
      } else {
        console.log('I should not see the upload and jobs widget');
      }
    },
    refreshUser: function () {
      console.log('refreshing user');
      xhr.get(this.userServiceURL + '/user/' + window.localStorage.userid, {
        headers: {
          'Accept': 'application/json',
          'Authorization': window.App.authorizationToken
        }
      })
        .then(
          function (user) {
            var userObj = JSON.parse(user);
            // console.log(userObj);
            userObj.id += '@patricbrc.org';
            // console.log(userObj);
            user = JSON.stringify(userObj);
            localStorage.removeItem('userProfile');
            localStorage.setItem('userProfile', user);
            // document.body.className += 'Authenticated';
            window.location.reload();
          },
          function (err) {
            console.log(err);
          }
        );
    },
    logout: function () {
      if (window.App.uploadInProgress) {
        alert('upload is in progress, try Logout again later');
        return;
      }

      localStorage.removeItem('tokenstring');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('auth');
      localStorage.removeItem('userid');
      localStorage.removeItem('Aauth');
      localStorage.removeItem('Atokenstring');
      localStorage.removeItem('AuserProfile');
      localStorage.removeItem('Auserid');
      window.location.assign('/');
      // remove the upload and jobs widget
      window.App.uploadJobsWidget('hide');
    },
    updateMyDataSection: function (data) {
      var node = dom.byId('YourWorkspaceLink2');
      if (!node) {
        return;
      }
      // console.warn(data)
      domAttr.set('YourWorkspaceLink2', 'href', '/workspace/' + this.user.id);
      data.filter(function (ws) {
        return ws.name === 'home';
      }).forEach(function (ws) {
        // console.log(ws)
        var wsGGNode = dom.byId('MyDataGenomeGroup');
        var wsFGNode = dom.byId('MyDataFeatureGroup');
        var wsEGNode = dom.byId('MyDataExperimentGroup');

        // update links
        wsGGNode.href = '/workspace' + ws.path + '/Genome%20Groups';
        wsFGNode.href = '/workspace' + ws.path + '/Feature%20Groups';
        wsEGNode.href = '/workspace' + ws.path + '/Experiment%20Groups';

        // update counts for workspace groups
        WorkspaceManager.getFolderContents(ws.path + '/Genome Groups')
          .then(function (items) {
            wsGGNode.innerHTML = items.length + ' Genome Groups';
          });
        WorkspaceManager.getFolderContents(ws.path + '/Feature Groups')
          .then(function (items) {
            wsFGNode.innerHTML = items.length + ' Feature Groups';
          });
        WorkspaceManager.getFolderContents(ws.path + '/Experiment Groups')
          .then(function (items) {
            wsEGNode.innerHTML = items.length + ' Experiment Groups';
          });

        // update counts for private genomes
        xhr.get(window.App.dataServiceURL + '/genome/?eq(public,false)', {
          headers: {
            'Accept': 'application/solr+json',
            'Content-Type': 'application/rqlquery+x-www-urlencoded',
            'Authorization': window.App.authorizationToken
          },
          handleAs: 'json'
        }).then(function (data) {
          // console.warn(data.response)
          var node = dom.byId('MyDataGenomes');
          node.innerHTML = data.response.numFound + ' Private Genomes';
        });
      });
    },
    updateUserWorkspaceList: function (data) {
      var wsNode = dom.byId('YourWorkspaces');
      domConstruct.empty('YourWorkspaces');

      data.forEach(function (ws) {
        if (ws.name !== 'home') return;
        var d = domConstruct.create('div', { style: { 'padding-left': '12px' } }, wsNode);
        domConstruct.create('i', {
          'class': 'fa icon-caret-down fa-1x noHoverIcon',
          style: { 'margin-right': '4px' }
        }, d);
        domConstruct.create('a', {
          'class': 'navigationLink',
          href: '/workspace' + ws.path,
          innerHTML: ws.name
        }, d);
        domConstruct.create('br', {}, d);
        domConstruct.create('a', {
          'class': 'navigationLink',
          'style': { 'padding-left': '16px' },
          href: '/workspace' + ws.path + '/Genome%20Groups',
          innerHTML: 'Genome Groups'
        }, d);
        domConstruct.create('br', {}, d);
        domConstruct.create('a', {
          'class': 'navigationLink',
          'style': { 'padding-left': '16px' },
          href: '/workspace' + ws.path + '/Feature%20Groups',
          innerHTML: 'Feature Groups'
        }, d);
        domConstruct.create('br', {}, d);
        domConstruct.create('a', {
          'class': 'navigationLink',
          'style': { 'padding-left': '16px' },
          href: '/workspace' + ws.path + '/Experiment%20Groups',
          innerHTML: 'Experiment Groups'
        }, d);
      });
    }
  });
});
