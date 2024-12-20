export const AppLinks = {
  Home: '/',
  Login: '/login',
  Logout: '/logout',
  Join: '/join',
  MyAccount: '/my-account',
  PickLists: '/pick-lists',
  AuditTrails: '/audit-trails',
  CustomerCare: '/customer-care',

  SupportJobStats: '/support-jobs-stats',
  SupportJobs: '/support-jobs',
  CreateSupportJob: '/support-jobs/create',
  EditSupportJob: (id: number) => `/support-jobs/${id}/edit`,

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

  Import: '/import-from-excel',
  Backup: '/export-accounts',

  AuditTrail: '/audit-trail',
  ChangePassword: '/change-password',
  ChangeOwnPassword: '/change-own-password',
};
