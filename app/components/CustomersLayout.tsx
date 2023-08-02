import type { ComponentProps } from 'react';
import type {
  LayoutOption,
  SortByOption,
  SortOrderOption,
} from '~/models/customers';

import React, { useCallback, useMemo } from 'react';

import { CustomerListCard } from './CustomerListCard';

interface Props {
  layout: LayoutOption;
  areaId: number;
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
  searchTerms: string;
  customers: (ComponentProps<typeof CustomerListCard>['customers'][number] & {
    area: { id: number; identifier: string } | null;
  })[];
}
function CustomersLayout(props: Props) {
  const {
    layout,
    areaId,
    sortBy,
    sortOrder,
    searchTerms,
    customers: suppliedCustomers,
  } = props;

  const filterByArea = useCallback(
    (customers: typeof suppliedCustomers) => {
      if (!areaId) {
        return customers;
      }
      return customers.filter((customer) => customer.area?.id === areaId);
    },
    [areaId]
  );

  const filterBySearchTerms = useCallback(
    (customers: typeof suppliedCustomers) => {
      if (!searchTerms) {
        return customers;
      }
      return customers.filter((customer) => {
        const preppedSearchTerms = searchTerms.toLowerCase();
        const conditions: boolean[] = [
          customer.accountNumber.toLowerCase().includes(preppedSearchTerms),
          customer.companyName.toLowerCase().includes(preppedSearchTerms),
          customer.license?.identifier
            .toLowerCase()
            .includes(preppedSearchTerms) || false,
          customer.accountantName.toLowerCase().includes(preppedSearchTerms) ||
            false,
          customer.accountantEmail.toLowerCase().includes(preppedSearchTerms) ||
            false,
        ];
        return conditions.some((condition) => condition);
      });
    },
    [searchTerms]
  );

  const sortCustomers = useCallback(
    (customers: typeof suppliedCustomers) => {
      if (sortBy === 'Account #') {
        return customers.sort((a, b) => {
          if (sortOrder === 'A to Z') {
            return a.accountNumber.localeCompare(b.accountNumber);
          }
          return b.accountNumber.localeCompare(a.accountNumber);
        });
      }
      if (sortBy === 'Company Name') {
        return customers.sort((a, b) => {
          if (sortOrder === 'A to Z') {
            return a.companyName.localeCompare(b.companyName);
          }
          return b.companyName.localeCompare(a.companyName);
        });
      }
      if (sortBy === 'License') {
        return customers.sort((a, b) => {
          if (sortOrder === 'A to Z') {
            return (
              a.license?.identifier.localeCompare(
                b.license?.identifier || '-'
              ) || 1
            );
          }
          return (
            b.license?.identifier.localeCompare(a.license?.identifier || '-') ||
            1
          );
        });
      }
      return customers;
    },
    [sortBy, sortOrder]
  );

  const customers = useMemo(() => {
    const filteredByArea = filterByArea(suppliedCustomers);
    const filteredBySearchTerms = filterBySearchTerms(filteredByArea);
    return sortCustomers(filteredBySearchTerms);
  }, [filterByArea, sortCustomers, suppliedCustomers, filterBySearchTerms]);

  if (layout === 'Alphabetical Order') {
    return <CustomerListCard title="Customers" customers={customers} />;
  }

  interface CustomerGroup {
    id: number;
    identifier: string;
    customers: typeof customers;
  }
  const customerGroups = customers.reduce((acc, customer) => {
    const matchingArea = acc.find((area) => area.id === customer.area?.id);
    if (matchingArea) {
      return acc.map((area) => {
        if (area.id === customer.area?.id) {
          return { ...area, customers: [...area.customers, customer] };
        }
        return area;
      });
    }
    return [
      ...acc,
      {
        id: customer.area?.id || 0,
        identifier: customer.area?.identifier || '',
        customers: [customer],
      },
    ];
  }, [] as CustomerGroup[]);

  return (
    <>
      {customerGroups.map((group) => (
        <CustomerListCard
          key={group.id}
          title={`${group.identifier} - ${group.customers.length} customers`}
          customers={group.customers}
        />
      ))}
    </>
  );
}

export default React.memo(CustomersLayout);
