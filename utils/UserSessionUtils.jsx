import StorageParams from "../constants/StorageParams";
import {AsyncStorage} from "@react-native-async-storage/async-storage"

export class UserSessionUtils {
  /**
   * This is used to get the user's bearer token.
   *
   * @returns
   */
  static getBearerToken() {
    return AsyncStorage.getItem(StorageParams.ACCESS_TOKEN);
  }

  /**
   * This is used to get the user's refresh token.
   *
   * @returns
   */
  static getRefreshToken() {
    return AsyncStorage.getItem(StorageParams.REFRESH_TOKEN);
  }
  /**
   * This method is used to clear the local storage and redirect the user to the login screen
   */
  static clearAsyncStorageAndLogout() {
    // remove all
    this.setUserAuthToken(null);
    AsyncStorage.clear();
  }

  /**
   * This method is use to set the user's bearer token.
   *
   * @param bearerToken
   */
  static setUserAuthToken(bearerToken) {
    AsyncStorage.setItem(StorageParams.ACCESS_TOKEN, bearerToken);
  }

  /**
   *
   */
  static setUserPermissions(permissions) {
    AsyncStorage.setItem(StorageParams.PERMISSIONS, permissions);
  }

  /**
   *
   */
  static setSuperAdmin(superAdmin) {
    AsyncStorage.setItem(StorageParams.IS_SUPER_ADMIN, superAdmin);
  }

  /**
   * This method is use to set the user's bearer token.
   *
   * @param bearerToken
   */
  static setUserSettings(settings) {
    AsyncStorage.setItem(StorageParams.USER_SETTINGS, JSON.stringify(settings));
  }

  /**
   * This method is use to set the user's app settings.
   *
   */
  static getUserSettings() {
    const value = AsyncStorage.getItem(StorageParams.USER_SETTINGS);
    return JSON.parse(value);
  }

  static getPermissions() {
    const value = AsyncStorage.getItem(StorageParams.PERMISSIONS);
    return JSON.parse(value);
  }

  static getSuperAdmin() {
    const value = AsyncStorage.getItem(StorageParams.IS_SUPER_ADMIN);
    return JSON.parse(value);
  }

  /**
   * This method is use to set the user's bearer token.
   *
   * @param bearerToken
   */
  static setFullSessionObject(fullObject) {
    AsyncStorage.setItem(
      StorageParams.FULL_LOGIN_DETAILS_JSON,
      JSON.stringify(fullObject)
    );
  }

  /**
   * This method is use to set the user's bearer token.
   *
   * @param bearerToken
   */
  static getFullSessionObject() {
    const value = AsyncStorage.getItem(StorageParams.FULL_LOGIN_DETAILS_JSON);
    return JSON.parse(value);
  }
  /**
   * This method is used to set the user's refresh token.
   *
   * @param refreshToken
   */
  static setUserRefreshToken(refreshToken) {
    AsyncStorage.setItem(StorageParams.REFRESH_TOKEN, refreshToken);
  }

  /**
   * This method is used to save a JSON object containing user details to local storage.
   *
   * @param userDetails
   */
  static setUserDetails(userData) {
    const detailsToStore = {
      // Core user details
      id: userData.id,
      fullName: userData.fullName,
      primaryEmail: userData.email,
      roles: userData.roles,
      countryId: userData.countryId,
      gender: userData.gender,
    };

    AsyncStorage.setItem(
      StorageParams.USER_DETAILS_JSON,
      JSON.stringify(detailsToStore)
    );
  }

  /**
   * This method is used to get a JSON object containing user details
   * @returns
   */
  static getUserDetails() {
    try {
      const data = AsyncStorage.getItem(StorageParams.USER_DETAILS_JSON);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("User details parse error:", error);
      return null;
    }
  }


  /**
   * This method is used to get user logged in status
   * @returns
   */
  static isLoggedIn() {
    return AsyncStorage.getItem(StorageParams.IS_LOGGED_IN) === "true";
  }

  /**
   * This method is used to set user logged in status
   * @returns
   */
  static setLoggedIn(loggedIn) {
    AsyncStorage.setItem(StorageParams.IS_LOGGED_IN, loggedIn.toString());
  }

  /**
   * This method is used to get the stored expo device Id.
   */
  static getDeviceId() {
    return AsyncStorage.getItem(StorageParams.EXPO_DEVICE_ID);
  }

  /**
   * This method is used to store the expo device Id.
   */
  static setDeviceId(token) {
    AsyncStorage.setItem(StorageParams.EXPO_DEVICE_ID, token);
  }

  /**
   * This method is used to save a JSON object containing country details.
   *
   * @param country
   */
  static setUserCountry(country) {
    AsyncStorage.setItem(StorageParams.COUNTRY, JSON.stringify(country));
  }

  /**
   * This method is used to get user country details
   * @returns
   */
  static getUserCountry() {
    return AsyncStorage.getItem(StorageParams.COUNTRY);
  }

  /**
   * This method is used to save a JSON object containing language.
   *
   * @param language
   */
  static setUserLanguage(language) {
    AsyncStorage.setItem(StorageParams.LANGUAGE, JSON.stringify(language));
  }

  /**
   * This method is used to get a JSON object containing user country details
   * @returns
   */
  static getUserLanguage() {
    return AsyncStorage.getItem(StorageParams.LANGUAGE);
  }

  static async setLoginTime(time) {
    return AsyncStorage.setItem(StorageParams.LOGIN_TIME, time);
  }

  /**
   * This method is used to get the login timestamp
   * @returns
   */
  static getLoginTime() {
    let time = AsyncStorage.getItem(StorageParams.LOGIN_TIME);
    return time;
  }

  /**
   * This method checks if the user is authenticated.
   * @returns {boolean}
   */
  static isAuthenticated() {
    const accessToken = this.getBearerToken();
    return !!accessToken; // Returns true if the access token exists
  }

  /**
   * This method logs the user out by clearing the session and redirecting to the login page.
   */
  static logout() {
    this.clearAsyncStorageAndLogout();
  }
}
