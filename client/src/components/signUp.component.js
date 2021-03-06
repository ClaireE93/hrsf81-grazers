module.exports = {
  bindings: {
    signUp: '<',
  },
  controller($http, $scope) {
    this.roles = [];
    this.jobs = [];
    this.events = [];
    this.eventObj = {};
    this.isNewEvent = false;

    this.loadConferences = (() => {
      const eventObj = {};
      $http.get('/events')
        .then(response => response.data)
        .then((data) => {
          this.events = data;
          this.events.push({ name: 'I want to organize an event', id: 'NEW' });
          data.forEach((event) => {
            eventObj[event.id] = { name: event.name, groupData: {} };
          });
          return this.loadGroupAndType();
        })
        .then((groupData) => {
          groupData.forEach((group) => {
            const curObj = eventObj[group.event_id].groupData;
            if (curObj[group.type]) {
              curObj[group.type].push(group.name);
            } else {
              curObj[group.type] = [group.name];
            }
          });
          this.eventObj = eventObj;
        })
        .catch((err) => {
          console.log('conference err is', err);
        });
    })();

    this.loadGroupAndType = () => (
      new Promise((resolve, reject) => {
        $http.get('/groups')
          .then(response => response.data)
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            console.log('conference err is', err);
            reject(err);
          });
      })
    );
    $scope.form = {
      firstname: '',
      lastname: '',
      password: '',
      conference: '',
      conferenceInput: '',
      conferenceId: '',
      role: '',
      job: '',
      email: '',
    };

    this.loadRoles = () => {
      const curConf = JSON.parse($scope.form.conferenceInput);
      const curConfId = curConf.id;
      this.roles = Object.keys(this.eventObj[curConfId].groupData);
      const organizerInd = this.roles.indexOf('organizer');
      if (organizerInd > -1) { this.roles.splice(organizerInd, 1); }
    };

    this.loadJobs = () => {
      const curConf = JSON.parse($scope.form.conferenceInput);
      const curConfId = curConf.id;
      this.jobs = this.eventObj[curConfId].groupData[$scope.form.role];
    };

    this.selectChange = () => {
      const curConf = JSON.parse($scope.form.conferenceInput);
      if (curConf.id === 'NEW') {
        this.isNewEvent = true;
      } else {
        this.isNewEvent = false;
      }
    };

    this.handleClick = () => {
      // TODO: remove conference and conferenceId?
      $scope.form.conferenceId = JSON.parse($scope.form.conferenceInput).id;
      $scope.form.event_id = JSON.parse($scope.form.conferenceInput).id;
      // $scope.form.conferenceName = JSON.parse($scope.form.conference).name;
      $scope.form.conference = JSON.parse($scope.form.conferenceInput).name;
      $scope.form.event = JSON.parse($scope.form.conferenceInput).name;
      if (this.isNewEvent) {
        $scope.form.conference = '';
        $scope.form.role = 'organizer';
      }
      $http.post('/user', $scope.form)
        .then(response => response.data)
        .then((data) => {
          const userData = Object.assign(
            {},
            $scope.form,
            { id: data.userId, group_id: data.groupId }
          );
          this.signUp(userData);
        })
        .catch((err) => {
          // TODO: This email is already taken, try again.
          console.log('err is', err);
        });
    };
  },
  templateUrl: 'signUp.template.html'
};
