export const AppLinks = {
  Home: '/',
  Login: '/login',
  Logout: '/logout',
  Join: '/join',
  MyAccount: '/my-account',
  PickLists: '/pick-lists',
  AuditTrails: '/audit-trails',
  CustomerCare: '/customer-care',

  AddRecord: '/add-record',
  UpdateRecord: '/update-record',
  DeleteRecord: '/delete-record',

  Customers: '/customers',
  AddCustomer: '/customers/create',
  Customer: (id: number) => `/customers/${id}`,
  EditCustomer: (id: number) => `/customers/${id}/edit`,

  Users: '/users',
  AddUser: '/users/create',
  EditUser: (id: number) => `/users/${id}/edit`,

  Import: '/customers/import',
  Backup: '/export-accounts',

  AuditTrail: '/audit-trail',
  ChangePassword: '/change-password',
  ChangeOwnPassword: '/change-own-password',
};
