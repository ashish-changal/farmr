// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // firebase: {
  //   apiKey: "AIzaSyDVdupV_7h54mzeIgqYZadFUX1NbniNJ0g",
  //   authDomain: "farmr-developer.firebaseapp.com",
  //   databaseURL: "https://farmr-developer.firebaseio.com",
  //   projectId: "farmr-developer",
  //   storageBucket: "farmr-developer.appspot.com",
  //   messagingSenderId: "512309017772"
  // },
  firebase: {
    apiKey: "AIzaSyBrDxvJnraaM4D5wdNsHVnJrNk6nq6nkVk",
    authDomain: "farmr-qa.firebaseapp.com",
    databaseURL: "https://farmr-qa.firebaseio.com",
    projectId: "farmr-qa",
    storageBucket: "farmr-qa.appspot.com",
    messagingSenderId: "262580171759"
  },
  // serverUrl: "http://testbean-env.hccqj92qht.ap-south-1.elasticbeanstalk.com/",
  serverUrl: "http://localhost:3000/",
  stripeKey:"pk_test_QeJebXdEV0Nd44prFdBkvbP1",
  uid: '',
  farmMiles: 100
};
