import { readFile, writeFile } from 'fs/promises';

import { prisma } from '~/db.server';

export async function downloadAllData() {
  const record_supportJob = await prisma.supportJob.findMany();
  const record_supportJobEvent = await prisma.supportJobEvent.findMany();
  const record_account = await prisma.account.findMany();
  const record_accountEvent = await prisma.accountEvent.findMany();
  const record_area = await prisma.area.findMany();
  const record_areaEvent = await prisma.areaEvent.findMany();
  const record_city = await prisma.city.findMany();
  const record_cityEvent = await prisma.cityEvent.findMany();
  const record_database = await prisma.database.findMany();
  const record_databaseEvent = await prisma.databaseEvent.findMany();
  const record_group = await prisma.group.findMany();
  const record_groupEvent = await prisma.groupEvent.findMany();
  const record_licenseDetail = await prisma.licenseDetail.findMany();
  const record_licenseDetailEvent = await prisma.licenseDetailEvent.findMany();
  const record_license = await prisma.license.findMany();
  const record_licenseEvent = await prisma.licenseEvent.findMany();
  const record_operator = await prisma.operator.findMany();
  const record_operatorEvent = await prisma.operatorEvent.findMany();
  const record_sector = await prisma.sector.findMany();
  const record_sectorEvent = await prisma.sectorEvent.findMany();
  const record_status = await prisma.status.findMany();
  const record_statusEvent = await prisma.statusEvent.findMany();
  const record_user = await prisma.user.findMany();
  const record_userEvent = await prisma.userEvent.findMany();

  await saveToJson('./data/supportJob.json', record_supportJob);
  await saveToJson('./data/supportJobEvent.json', record_supportJobEvent);
  await saveToJson('./data/account.json', record_account);
  await saveToJson('./data/accountEvent.json', record_accountEvent);
  await saveToJson('./data/area.json', record_area);
  await saveToJson('./data/areaEvent.json', record_areaEvent);
  await saveToJson('./data/city.json', record_city);
  await saveToJson('./data/cityEvent.json', record_cityEvent);
  await saveToJson('./data/database.json', record_database);
  await saveToJson('./data/databaseEvent.json', record_databaseEvent);
  await saveToJson('./data/group.json', record_group);
  await saveToJson('./data/groupEvent.json', record_groupEvent);
  await saveToJson('./data/licenseDetail.json', record_licenseDetail);
  await saveToJson('./data/licenseDetailEvent.json', record_licenseDetailEvent);
  await saveToJson('./data/license.json', record_license);
  await saveToJson('./data/licenseEvent.json', record_licenseEvent);
  await saveToJson('./data/operator.json', record_operator);
  await saveToJson('./data/operatorEvent.json', record_operatorEvent);
  await saveToJson('./data/sector.json', record_sector);
  await saveToJson('./data/sectorEvent.json', record_sectorEvent);
  await saveToJson('./data/status.json', record_status);
  await saveToJson('./data/statusEvent.json', record_statusEvent);
  await saveToJson('./data/user.json', record_user);
  await saveToJson('./data/userEvent.json', record_userEvent);
}

export async function saveToJson(filePath: string, data: any) {
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(error);
  }
}

export async function readFromJson(filePath: string) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
