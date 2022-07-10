export class Organization {
  name: string;
  
  constructor(name: string) {
    this.name = name
  }
}

export enum UserRole {
  UNDEFINE = 'undefined'
}
// TODO

export class User {
  id: number;
  organization: Organization;
  
  constructor(
    id: number,
  ) {
    this.id = id;
    this.organization = new Organization('test');
  }
}
