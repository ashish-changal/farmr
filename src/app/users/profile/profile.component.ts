import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared.service';
import { UsersComponent } from '../users.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/auth.service';
import { UserDetail } from '../../models/user.model';
import { Card } from '../../models/cartitems.model';
import { NgxSpinnerService } from 'ngx-spinner';
declare var jQuery: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],

})
export class ProfileComponent implements OnInit {
  user: UserDetail = <UserDetail>[];
  defaultCard: string;
  last4Digits: any;
  toggle: boolean = false;
  disable: boolean = true;
  originalData: UserDetail = <UserDetail>{};
  originalDataCard: Card = <Card>{};
  card: Card = <Card>{};
  cardFeildenable: boolean = false;
  uid: any;
  invalidUserCity: boolean = false;
  invalidCardCity: boolean = false;
  cardAdd:boolean = false;
  states = [
    ('AL'), ('AK'), ('AZ'), ('AR'), ('CA'), ('CO'), ('CT'), ('DE'), ('FL'), ('GA'),
    ('HI'), ('ID'), ('IL'), ('IN'), ('IA'), ('KS'), ('KY'), ('LA'), ('ME'), ('MD'),
    ('MA'), ('MI'), ('MN'), ('MS'), ('MO'), ('MT'), ('NE'), ('NV'), ('NH'), ('NJ'),
    ('NM'), ('NY'), ('NC'), ('ND'), ('OH'), ('OK'), ('OR'), ('PA'), ('RI'), ('SC'),
    ('SD'), ('TN'), ('TX'), ('UT'), ('VT'), ('VA'), ('MI'), ('WA'), ('WV'), ('WI'), ('WY')

  ];
  response: string = "";

  isInValid: boolean = false;
  isCardInValid: boolean = false;
  autoCityValues = [];
  autoCardCityValues = [];
  constructor(public sharedService: SharedService, public parent: UsersComponent,
    public userService: UserService, public authService: AuthService, public spinner: NgxSpinnerService, ) {

  }

  ngOnInit() {
    this.authService.checkLogin().take(1).subscribe((uid) => {
      if (uid) {
        if (this.sharedService.cityNames.length == 0) {
          this.sharedService.getCitiesName();
        }
        this.uid = uid;
        this.getUserDetails(uid);
      }
    })
  }

  getUserDetails(uid) {
    this.response = "";
    this.authService.getUserInformation(uid).then((userInfo) => {

      if (userInfo.length > 0) {
        this.user.firstname = userInfo[0]['firstname'];
        this.user.lastname = userInfo[0]['lastname'];
        this.user.streetaddress1 = userInfo[0]['streetaddress1'];
        this.user.streetaddress2 = userInfo[0]['streetaddress2'];
        this.user.city = userInfo[0]['city'];
        this.user.state = userInfo[0]['state'];
        this.user.zipcode = userInfo[0]['zipcode'];

        this.user.phonenumber = '(' + userInfo[0]['phonenumber'].substr(0, 3) + ') ' + userInfo[0]['phonenumber'].substr(3, 3) + '-' + userInfo[0]['phonenumber'].substr(6, 4);
        this.user.points = Math.round(userInfo[0]['points'] ? userInfo[0]['points'] : 0);
        let cards = userInfo[0]['cards'];
        if (cards != null && cards != undefined) {
          this.cardAdd = false;
          let data: Card = <Card>{};
          let cardArray = [];
          this.defaultCard = cards.default ? cards.default : '';
          this.user.defaultcard = cards.default ? cards.default : '';
          Object.keys(cards).map((key) => {
            if (key != 'default') {
              data = <Card>{};
              data = cards[key];
              data['key'] = key;
              data.encodedNumber = cards[key]['number'];
              var finalresult = this.sharedService.descryptCardNumber(cards[key]['number']);
              data.number = "XXXX-XXXX-XXXX-" + finalresult.substr(12, 4);
              cardArray.push(data);
            }
          })
          this.user.cards = cardArray;
          if (this.defaultCard != '') {
            this.changeDefaultCard();
          } else {
            this.cardFeildenable = true;
          }
        } else {
          this.cardAdd = true;
          this.user.cards = [];
          this.card = <Card>{};
          this.cardFeildenable = true;
        }
        this.originalData = Object.assign({}, this.user);
        this.originalDataCard = Object.assign({}, this.card);
      }
    })

  }

  deleteConfirmCard() {
    jQuery("#deletecardmodal").modal('show');
  }
  ngAfterViewInit() {
    this.parent.pageTitle = "Profile";
    setTimeout(() => {
      this.sharedService.selectSidemenu('profile');
      this.sharedService.setSearchBox(false);
    })
  }
  changeDefaultCard() {

    for (let i = 0; i < this.user.cards.length; i++) {
      if (this.user.cards[i].key == this.defaultCard) this.card = this.user.cards[i];
    }
    this.toggle = true;
    this.cardAdd = false;
  }
  selectMonth(val: any) {
    this.card.expMonth = val;
  }
  selectYear(val: any) {
    this.card.expYear = val;
  }
  addCardDetail(cardForm) {
    if (cardForm.valid) {
      let cityname = this.sharedService.cityNames.filter((item) => {
        return item.toLowerCase() == this.card.address_city.toLowerCase();
      })
      if (cityname.length == 0) {
        this.invalidCardCity = true;
      } else {
        if (this.card['key'] != undefined && this.card['key'] != null && this.card['key'] != "") {
          this.spinner.show();
          this.card.date = this.card.expYear + '-' + this.card.expMonth;
          this.userService.updatePaymentCard(this.card, this.uid).then(() => {
            this.getUserDetails(this.uid);
            this.cardFeildenable = false;
            this.spinner.hide();
          })
          this.originalDataCard = Object.assign({}, this.card);
        } else {
          this.spinner.show();
          this.card.date = this.card.expYear + '-' + this.card.expMonth;
          //this.response = "Please select an card which you want to update";
          this.userService.addPaymentCard(this.card, this.uid).then(() => {
            this.toggle = !this.toggle;
            this.getUserDetails(this.uid);
            this.cardFeildenable = false;
            this.spinner.hide();
          });
        }
      }
    }
    else {
      this.isCardInValid = true;
    }
  }
  _keyPress(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;

  }
  updateUserProfile(profileForm) {

    if (profileForm.valid) {

      let cityname = this.sharedService.cityNames.filter((item) => {
        return item.toLowerCase() == this.user.city.toLowerCase();
      })
      if (cityname.length == 0) {
        this.invalidUserCity = true;
      } else {
        this.spinner.show();
        let number = this.sharedService.unmaskPhonenumber(this.user.phonenumber);
        this.userService.updateUserProfile(number, this.user, this.uid).then((res) => {
          if (res) {
            this.spinner.hide();
            this.originalData = Object.assign({}, this.user);
            this.getUserDetails(this.uid);
            this.disable = true;
          }
          else {
            this.spinner.hide();
          }
          setTimeout(() => {
            this.response = "";
          }, 60000);
        })
      }
    } else {
      this.isInValid = true;
    }
  }
  deleteCard() {
    jQuery("#deletecardmodal").modal('hide');
    this.spinner.show();
    if (this.card.key != '' && this.card.key != undefined && this.card.key != null) {
      this.userService.deletePaymentCard(this.uid, this.card.key).then(() => {
        if (this.card.key == this.user.defaultcard) {
          this.userService.removeDefaultCard(this.uid).then(() => {
            this.getUserDetails(this.uid);
            this.spinner.hide();
          })
        } else {
          this.getUserDetails(this.uid);
          this.spinner.hide();
        }
      })
    } else {
      this.response = "Please select a card to delete";
    }
  }
  cancel() {
    this.disable = true;
    this.user = Object.assign({}, this.originalData);
  }
  cardEditBtn() {
    this.cardFeildenable = true;
  }
  cancelCard() {
    if(Object.keys(this.originalDataCard).length > 0){
      this.cardFeildenable = false;
      this.card = Object.assign({}, this.originalDataCard);
      this.cardAdd = false;
    }else{
      this.toggle = false;
    }
  }

  autoComplete(val, field) {
    this.autoCityValues = [];
    this.autoCardCityValues = [];
    if (field == 'card') {
      if (val && val.trim() != "") {
        this.autoCardCityValues = this.sharedService.cityNames.filter((item) => {
          return item.toLowerCase().indexOf(val.toLowerCase()) == 0;
        })
      } else {
        this.autoCardCityValues = [];
      }
    } else {
      if (val && val.trim() != "") {
        this.autoCityValues = this.sharedService.cityNames.filter((item) => {
          return item.toLowerCase().indexOf(val.toLowerCase()) == 0;
        })
      } else {
        this.autoCityValues = [];
      }
    }
  }

  selectItem(value, field) {
    this.autoCityValues = [];
    this.autoCardCityValues = [];
    if (field == 'card') {
      this.card.address_city = value;
    } else {
      this.user.city = value;
    }
  }

  setDefault(field) {
    if (field == 'profile') {
      this.invalidUserCity = false;
    } else {
      this.invalidCardCity = false;
    }
  }
  openCardForm(){
    this.toggle = true;
    this.cardFeildenable = true;
    this.card = <Card>{};
    this.cardAdd = true;
  }
}
