export interface Organization {
  name: string;
  // TODO : this will modelize
  // an organization to which the user belongs
  // id: string;
  // name: string;
}

export enum UserRole {
  UNDEFINE = 'undefined'
}
// TODO

export interface User {
  id: string;
  // TODO
  // a user will belong to an org
  // id: string;
  // firstName: string;
  // lastName: string;
  // roles: Array<UserRole>;
  // organization: Organization;
}
