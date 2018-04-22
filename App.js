import React, { Component } from 'react'
import { Image, ScrollView, View, Text, Platform, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { AppLoading, Asset } from 'expo';
import moment from 'moment';



function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

class Inputs extends Component {
  state = {
    email: '',
    password: '',
    isReady: false,
    message: '',
    current_user: {},
    subscriptions: []
  }



  handleEmail = (text) => {
    this.setState({ email: text })
  }
  handlePassword = (text) => {
    this.setState({ password: text })
  }
  login = () => {

    let email = this.state.email;
    let password = this.state.password;
    fetch("http://ontime.curiousmind.tech/api/v1/users", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password: password })
    }).then((response) => response.json())
      .then((responseJson) => {
        this.setState({ current_user: responseJson.data });
        if (responseJson.data.token) {
          return this.subscriptionForUser(responseJson.data.token);
        } else {
          alert('Invalid credentials. Please try again');
        }

      })
      .catch((error) => {
        alert('We have encountered an unexpected error. Please try again later');
      });
  }

  subscriptionForUser = (token) => {
    console.log("subscriptions");
    fetch("http://192.168.1.155:4000/api/v1/subscriptions?token=" + token, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

    }).then((response) => response.json()).
      then((responseJson) => {
        if (responseJson.data) {
          this.setState({ subscriptions: responseJson.data });
        }
      }).catch((error) => {
        alert('We have encountered an unexpected error. Please try again later');
      });
  }





  async _loadAssetsAsync() {
    const imageAssets = cacheImages([
      require('./assets/ic_flight_3x.png'),
    ]);

    await Promise.all([...imageAssets]);
  }

  render() {

    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }

    if (!this.state.current_user.token) {
      return (
        <View style={styles.container} >
          <Text style={styles.welcomeText}>
            <Image source={require('./assets/ic_flight_3x.png')}
              style={styles.welcomeImage} /> Ontime Flight Alerts
        </Text>

          <Text style={styles.loginText}>
            Login
        </Text>
          <TextInput style={styles.input}
            underlineColorAndroid="transparent"
            placeholder="Email"
            placeholderTextColor="#00a9ff"
            autoCapitalize="none"
            onChangeText={this.handleEmail} />

          <TextInput style={styles.input}
            underlineColorAndroid="transparent"
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#00a9ff"
            autoCapitalize="none"
            onChangeText={this.handlePassword} />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={this.login}>
            <Text style={styles.submitButtonText}> Submit </Text>
          </TouchableOpacity>

          <View style={styles.tabBarInfoContainer}>
            <Text style={styles.tabBarInfoText}>For advanced flight searches, visit our website on</Text>

            <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
              <Text style={styles.codeHighlightText}>ontime.curiousmind.tech</Text>
            </View>
          </View>


        </View>
      )
    }

    if (this.state.current_user.token && this.state.subscriptions.length == 0) {
      return (
        <View style={styles.container} >
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={this.login}>
              <Text style={styles.logoutButtonText}> Logout </Text>
            </TouchableOpacity>

            <Text style={styles.loginText}>
              You have not subscribed for any flight alerts at the moment.
               Please visit out website ontime.curiousmind.tech for subscribing to new flight alerts.
                Thankyou!!!
           </Text>

          </ScrollView>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => this.setState({ current_user: {} })}>
            <Text style={styles.logoutButtonText}> LOGOUT </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (this.state.current_user.token && this.state.subscriptions.length > 0) {
      return (
        <View style={styles.subContainer}>
          <TouchableOpacity
            style={styles.alertButton}>
            <Text style={styles.alertsButtonText}> Active Flight Alerts </Text>
          </TouchableOpacity>

          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.subscriptionText}>
              Susbscription Details
            </Text>
            <Text style={styles.loginText}>
              Arrival Airport Details
              </Text>
            {this.state.subscriptions.map((sub, index) =>
              <View key={index}>
                <View style={styles.subDetails}>
                  <Text >
                    Airline: {sub.airline_name}
                  </Text>
                  <Text >
                    Arrival Airport Code: {sub.dest_iata}
                  </Text>
                  <Text >
                    Arrival Gate: {sub.flight_data.airportResources.arrivalGate}
                  </Text>
                  <Text >
                    Arrival Terminal: {sub.flight_data.airportResources.arrivalTerminal}
                  </Text>
                  <Text >
                    Arrival Time: {moment(sub.flight_data.arrivalDate.dateLocal).format('MM/DD/YYYY h:mm a')}
                  </Text>
                </View>
                <Text style={styles.loginText}>
                  Departure Airport Details
              </Text>
                <View style={styles.subDetails}>
                  <Text >
                    Airline: {sub.airline_name}
                  </Text>
                  <Text >
                    Departure Airport Code: {sub.srcia_iata}
                  </Text>
                  <Text >
                    Departure Gate: {sub.flight_data.airportResources.departureGate}
                  </Text>
                  <Text >
                    Departure Terminal: {sub.flight_data.airportResources.departureTerminal}
                  </Text>
                  <Text >
                    Departure Time: {moment(sub.flight_data.departureDate.dateLocal).format('MM/DD/YYYY h:mm a')}
                  </Text>
                </View>
              </View>

            )

            }

          </ScrollView>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => this.setState({ current_user: {} })}>
            <Text style={styles.logoutButtonText}> LOGOUT </Text>
          </TouchableOpacity>

        </View>
      );
    }

  }
}
export default Inputs

const styles = StyleSheet.create({
  container: {
    paddingTop: 23,
    flex: 1,
    backgroundColor: 'white',
  },
  welcomeImage: {
    width: 40,
    height: 30,
    resizeMode: 'contain',
    marginTop: 2,
    marginLeft: 20,

  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  subContainer: {
    paddingTop: 23,
    flex: 1,
    backgroundColor: 'white',
    width: 500,

  },
  subDetails: {
    marginTop: 2,
    margin: 25,
    width: 300,
    height: 100,
    padding: 5,
  },
  input: {
    marginTop: 0,
    margin: 25,
    width: 300,
    height: 40,
    borderColor: '#00a9ff',
    borderWidth: 1,
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#00a9ff',
    padding: 9,
    marginLeft: 130,
    marginRight: 150,
    height: 40,
  },
  alertButton: {
    backgroundColor: '#00a9ff',
    padding: 10,
    height: 80,
  },
  logoutButton: {
    backgroundColor: '#ffb200',
    padding: 10,
    height: 40,
  },
  submitButtonText: {
    color: 'white',
    justifyContent: 'center',
  },
  alertsButtonText: {
    color: 'white',
    fontSize: 30,
  },
  logoutButtonText: {
    color: 'black',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeText: {
    marginTop: 50,
    margin: 40,
    color: '#00a9ff',
    fontWeight: 'bold',
    fontSize: 20,

  },
  subscriptionText: {
    marginTop: 0,
    margin: 10,
    color: '#00a9ff',
    fontWeight: 'bold',
    fontSize: 20,

  },
  loginText: {
    marginTop: 10,
    marginBottom: 10,
    margin: 20,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
    justifyContent: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#00a9ff',
    paddingVertical: 20,
  },
  contentContainer: {
    paddingTop: 0,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'black',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
})
