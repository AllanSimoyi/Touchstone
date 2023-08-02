import { createReadStream } from 'fs';

import { Response, type LoaderArgs } from '@remix-run/node';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';

import { prisma } from '~/db.server';
import { StatusCode } from '~/models/core.validations';
import { DATE_INPUT_FORMAT } from '~/models/dates';
import { getErrorMessage } from '~/models/errors';
import { requireUserId } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  try {
    const accounts = await prisma.account.findMany({
      include: {
        group: true,
        area: true,
        sector: true,
        status: true,
        license: true,
        licenseDetail: true,
        boxCity: true,
        deliveryCity: true,
        databases: true,
        operators: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    worksheet.columns = [
      { header: 'id', key: 'id' },
      { header: 'Account #', key: 'accountNumber' },
      { header: 'Company Name', key: 'companyName' },
      { header: 'Trading As', key: 'tradingAs' },
      { header: 'Formerly', key: 'formerly' },
      { header: 'Group', key: 'group' },
      { header: 'Area', key: 'area' },
      { header: 'Sector', key: 'sector' },
      { header: 'Vat #', key: 'vatNumber' },
      { header: 'Other Names On Cheques', key: 'otherNames' },
      { header: 'Description', key: 'description' },
      { header: 'Actual', key: 'actual' },
      { header: 'Reason', key: 'reason' },
      { header: 'Status', key: 'status' },
      { header: 'Contract #', key: 'contractNumber' },
      { header: 'Contract Date', key: 'dateOfContract' },
      { header: 'License', key: 'license' },
      { header: 'License Basic USD', key: 'licenseBasicUsd' },
      { header: 'License Detail', key: 'licenseDetail' },
      { header: 'Added %', key: 'addedPercentage' },
      { header: 'Gross', key: 'gross' },
      { header: 'Net', key: 'net' },
      { header: 'Vat', key: 'vat' },
      { header: 'Comment', key: 'comment' },
      { header: 'Ceo Name', key: 'ceoName' },
      { header: 'Ceo Email', key: 'ceoEmail' },
      { header: 'Ceo Phone', key: 'ceoPhone' },
      { header: 'Ceo Fax', key: 'ceoFax' },
      { header: 'Address', key: 'physicalAddress' },
      { header: 'Tel', key: 'telephoneNumber' },
      { header: 'Fax', key: 'faxNumber' },
      { header: 'Cell', key: 'cellphoneNumber' },
      { header: 'Accountant Name', key: 'accountantName' },
      { header: 'Accountant Email', key: 'accountantEmail' },
      { header: 'Box City', key: 'boxCity' },
      { header: 'Box #', key: 'boxNumber' },
      { header: 'Box Area', key: 'boxArea' },
      { header: 'Delivery City', key: 'deliveryCity' },
      { header: 'Delivery Address', key: 'deliveryAddress' },
      { header: 'Delivery Suburb', key: 'deliverySuburb' },
      { header: 'Databases', key: 'databases' },
      { header: 'Operators', key: 'operators' },
    ];

    accounts.forEach((account) => {
      worksheet.addRow({
        id: account.id,
        accountNumber: account.accountNumber,
        companyName: account.companyName,
        tradingAs: account.tradingAs,
        formerly: account.formerly,
        group: account.group?.identifier || '-',
        area: account.area?.identifier || '-',
        sector: account.sector?.identifier || '-',
        vatNumber: account.vatNumber,
        otherNames: account.otherNames,
        description: account.description,
        actual: account.actual,
        reason: account.reason,
        status: account.status?.identifier || '-',
        contractNumber: account.contractNumber,
        dateOfContract: dayjs(account.dateOfContract).format(DATE_INPUT_FORMAT),
        license: account.license?.identifier || '-',
        licenseBasicUsd: account.license?.basicUsd.toNumber().toFixed(2) || '-',
        licenseDetail: account.licenseDetail?.identifier || '-',
        addedPercentage: account.addedPercentage,
        gross: account.gross.toNumber().toFixed(2),
        net: account.net.toNumber().toFixed(2),
        vat: account.vat.toNumber(),
        comment: account.comment,
        ceoName: account.ceoName,
        ceoEmail: account.ceoEmail,
        ceoPhone: account.ceoPhone,
        ceoFax: account.ceoFax,
        physicalAddress: account.physicalAddress,
        telephoneNumber: account.telephoneNumber,
        faxNumber: account.faxNumber,
        cellphoneNumber: account.cellphoneNumber,
        accountantName: account.accountantName,
        accountantEmail: account.accountantEmail,
        boxCity: account.boxCity?.identifier || '-',
        boxNumber: account.boxNumber,
        boxArea: account.boxArea,
        deliveryCity: account.deliveryCity?.identifier || '-',
        deliveryAddress: account.deliveryAddress,
        deliverySuburb: account.deliverySuburb,
        databases: account.databases
          .map(({ databaseName }) => databaseName)
          .join(', '),
        operators: account.operators
          .map(
            ({ operatorName, operatorEmail }) =>
              `${operatorName}-${operatorEmail}`
          )
          .join(', '),
      });
    });

    const filename = `Touchstone_${dayjs().format(DATE_INPUT_FORMAT)}`;
    await workbook.xlsx.writeFile(filename);
    const stream = createReadStream(filename);

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=my-excel-file.xlsx',
      },
    });
  } catch (error) {
    const errorMessage =
      getErrorMessage(error) ||
      'Something went wrong exporting database, please try again';
    throw new Response(errorMessage, { status: StatusCode.BadRequest });
  }
}
