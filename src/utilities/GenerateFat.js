export async function generateFat(fileTree) {
  // FAT32
  const BYTES_PER_SECTOR = 512;
  const SECTORS_PER_CLUSTER = 8;
  const RESERVED_SECTORS = 32;
  const NUM_FATS = 2;
  const ROOT_CLUSTER = 2;
  const TOTAL_SECTORS = 3146496;
  const IMAGE_SIZE = BYTES_PER_SECTOR * TOTAL_SECTORS;
  const DATA_SECTORS = TOTAL_SECTORS - RESERVED_SECTORS - NUM_FATS * 250;
  const TOTAL_CLUSTERS = Math.floor(DATA_SECTORS / SECTORS_PER_CLUSTER);
  const SECTORS_PER_FAT = Math.ceil((TOTAL_CLUSTERS * 4) / BYTES_PER_SECTOR);
  const FAT_OFFSET = RESERVED_SECTORS * BYTES_PER_SECTOR;
  const FAT_SIZE = SECTORS_PER_FAT * BYTES_PER_SECTOR;
  const DATA_OFFSET =
    (RESERVED_SECTORS + NUM_FATS * SECTORS_PER_FAT) * BYTES_PER_SECTOR;
  const image = new Uint8Array(IMAGE_SIZE);

  image[0] = 0xeb;
  image[1] = 0x58;
  image[2] = 0x90;
  for (let i = 0; i < 8; i++) image[3 + i] = 'MSWIN4.1'.charCodeAt(i);
  image[11] = BYTES_PER_SECTOR & 0xff;
  image[12] = (BYTES_PER_SECTOR >> 8) & 0xff;
  image[13] = SECTORS_PER_CLUSTER;
  image[14] = RESERVED_SECTORS & 0xff;
  image[15] = (RESERVED_SECTORS >> 8) & 0xff;
  image[16] = NUM_FATS;
  image[17] = 0;
  image[18] = 0;
  image[19] = TOTAL_SECTORS > 0xffff ? 0 : TOTAL_SECTORS & 0xff;
  image[20] = TOTAL_SECTORS > 0xffff ? 0 : (TOTAL_SECTORS >> 8) & 0xff;
  image[21] = 0xf8;
  image[22] = 0;
  image[23] = 0;
  image[24] = 0x3f;
  image[25] = 0;
  image[26] = 0xff;
  image[27] = 0;
  image[28] = 0;
  image[29] = 0;
  image[30] = 0;
  image[31] = 0;
  image[32] = TOTAL_SECTORS & 0xff;
  image[33] = (TOTAL_SECTORS >> 8) & 0xff;
  image[34] = (TOTAL_SECTORS >> 16) & 0xff;
  image[35] = (TOTAL_SECTORS >> 24) & 0xff;
  image[36] = SECTORS_PER_FAT & 0xff;
  image[37] = (SECTORS_PER_FAT >> 8) & 0xff;
  image[38] = (SECTORS_PER_FAT >> 16) & 0xff;
  image[39] = (SECTORS_PER_FAT >> 24) & 0xff;
  image[40] = 0x00;
  image[41] = 0x00;
  image[42] = 0x00;
  image[43] = 0x00;
  image[44] = ROOT_CLUSTER & 0xff;
  image[45] = (ROOT_CLUSTER >> 8) & 0xff;
  image[46] = (ROOT_CLUSTER >> 16) & 0xff;
  image[47] = (ROOT_CLUSTER >> 24) & 0xff;
  image[48] = 1;
  image[49] = 0;
  image[50] = 6;
  image[51] = 0;
  for (let i = 52; i < 64; i++) image[i] = 0;
  for (let i = 64; i < 72; i++) image[i] = 0;
  for (let i = 72; i < 80; i++) image[i] = 0;
  for (let i = 80; i < 90; i++) image[i] = 0;
  for (let i = 90; i < 510; i++) image[i] = 0;
  image[510] = 0x55;
  image[511] = 0xaa;
  const fsinfo = 1 * BYTES_PER_SECTOR;
  image[fsinfo + 0] = 0x52;
  image[fsinfo + 1] = 0x52;
  image[fsinfo + 2] = 0x61;
  image[fsinfo + 3] = 0x41;
  for (let i = 4; i < 484; i++) image[fsinfo + i] = 0;
  image[fsinfo + 488] = 0xff;
  image[fsinfo + 489] = 0xff;
  image[fsinfo + 490] = 0xff;
  image[fsinfo + 491] = 0xff;
  image[fsinfo + 492] = 0xff;
  image[fsinfo + 493] = 0xff;
  image[fsinfo + 494] = 0xff;
  image[fsinfo + 495] = 0xff;
  image[fsinfo + 484] = 0x72;
  image[fsinfo + 485] = 0x72;
  image[fsinfo + 486] = 0x41;
  image[fsinfo + 487] = 0x61;
  image[fsinfo + 508] = 0x55;
  image[fsinfo + 509] = 0xaa;

  const backup = 6 * BYTES_PER_SECTOR;
  for (let i = 0; i < 512; i++) image[backup + i] = image[i];

  for (let fat = 0; fat < NUM_FATS; fat++) {
    const fatStart = FAT_OFFSET + fat * FAT_SIZE;
    image[fatStart + 0] = 0xf8;
    image[fatStart + 1] = 0xff;
    image[fatStart + 2] = 0xff;
    image[fatStart + 3] = 0x0f;
    image[fatStart + 4] = 0xff;
    image[fatStart + 5] = 0xff;
    image[fatStart + 6] = 0xff;
    image[fatStart + 7] = 0x0f;
  }

  function toShortName(name) {
    let base = '';
    let ext = '';
    const dotIdx = name.lastIndexOf('.');
    if (dotIdx === -1) {
      base = name;
      ext = '';
    } else {
      base = name.slice(0, dotIdx);
      ext = name.slice(dotIdx + 1);
    }
    base = base.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    ext = ext.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    base = base.slice(0, 8).padEnd(8, ' ');
    ext = ext.slice(0, 3).padEnd(3, ' ');
    return { base, ext };
  }

  function lfnChecksum(shortNameArr) {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum = (((sum & 1) << 7) | ((sum & 0xfe) >> 1)) + shortNameArr[i];
      sum = sum & 0xff;
    }
    return sum;
  }

  function createLfnEntries(longName, checksum) {
    const nameChars = Array.from(longName);
    const totalParts = Math.ceil(nameChars.length / 13);
    const entries = [];
    for (let i = 0; i < totalParts; i++) {
      const entry = new Uint8Array(32);
      entry.fill(0xff);
      const seq = i + 1;
      entry[0] = seq | (seq === totalParts ? 0x40 : 0x00);
      entry[11] = 0x0f;
      entry[12] = 0x00;
      entry[13] = checksum;
      entry[26] = 0x00;
      entry[27] = 0x00;
      const charIndexes = [1, 3, 5, 7, 9, 14, 16, 18, 20, 22, 24, 28, 30];
      let nullTerminatorSet = false;
      for (let j = 0; j < 13; j++) {
        const charIdx = i * 13 + j;
        const pos = charIndexes[j];
        let charCode;
        if (charIdx < nameChars.length) {
          charCode = nameChars[charIdx].charCodeAt(0);
        } else if (!nullTerminatorSet) {
          charCode = 0x0000;
          nullTerminatorSet = true;
        } else {
          charCode = 0xffff;
        }
        entry[pos] = charCode & 0xff;
        entry[pos + 1] = (charCode >> 8) & 0xff;
      }
      entries.push(entry);
    }
    return entries.reverse();
  }

  function collectFiles(node, arr = [], path = '') {
    if (node.kind === 'file') {
      node._fullPath = path + node.name;
      arr.push(node);
    } else if (node.kind === 'directory' && node.children) {
      for (const child of node.children) {
        collectFiles(child, arr, path + node.name + '/');
      }
    }
    return arr;
  }
  const allFiles = collectFiles(fileTree);

  const CLUSTER_SIZE = BYTES_PER_SECTOR * SECTORS_PER_CLUSTER;
  let dirEntryOffset = DATA_OFFSET;
  let dataCluster = 3;
  for (const node of allFiles) {
    const file = node.file;
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    const fileSize = fileBuffer.length;
    const { base, ext } = toShortName(file.name);
    const shortNameArr = [];
    for (let i = 0; i < 8; i++) shortNameArr.push(base.charCodeAt(i));
    for (let i = 0; i < 3; i++) shortNameArr.push(ext.charCodeAt(i));
    const checksum = lfnChecksum(shortNameArr);

    const lfnEntries = createLfnEntries(file.name, checksum);
    for (const lfnEntry of lfnEntries) {
      image.set(lfnEntry, dirEntryOffset);
      dirEntryOffset += 32;
    }

    for (let i = 0; i < 8; i++) image[dirEntryOffset + i] = base.charCodeAt(i);
    for (let i = 0; i < 3; i++)
      image[dirEntryOffset + 8 + i] = ext.charCodeAt(i);
    image[dirEntryOffset + 11] = 0x20;
    image[dirEntryOffset + 26] = dataCluster & 0xff;
    image[dirEntryOffset + 27] = (dataCluster >> 8) & 0xff;
    image[dirEntryOffset + 20] = (dataCluster >> 16) & 0xff;
    image[dirEntryOffset + 21] = (dataCluster >> 24) & 0xff;
    image[dirEntryOffset + 28] = fileSize & 0xff;
    image[dirEntryOffset + 29] = (fileSize >> 8) & 0xff;
    image[dirEntryOffset + 30] = (fileSize >> 16) & 0xff;
    image[dirEntryOffset + 31] = (fileSize >> 24) & 0xff;
    const clustersNeeded = Math.ceil(fileSize / CLUSTER_SIZE);
    for (let i = 0; i < clustersNeeded; i++) {
      const fatIndex = dataCluster + i;
      let value = i === clustersNeeded - 1 ? 0x0fffffff : fatIndex + 1;
      for (let fat = 0; fat < NUM_FATS; fat++) {
        const fatStart = FAT_OFFSET + fat * FAT_SIZE;
        const entryOffset = fatStart + fatIndex * 4;
        image[entryOffset + 0] = value & 0xff;
        image[entryOffset + 1] = (value >> 8) & 0xff;
        image[entryOffset + 2] = (value >> 16) & 0xff;
        image[entryOffset + 3] = (value >> 24) & 0xff;
      }
    }
    let dataPtr = DATA_OFFSET + (dataCluster - 2) * CLUSTER_SIZE;
    image.set(fileBuffer, dataPtr);
    dirEntryOffset += 32;
    dataCluster += clustersNeeded;
  }

  for (let fat = 0; fat < NUM_FATS; fat++) {
    const fatStart = FAT_OFFSET + fat * FAT_SIZE;
    image[fatStart + 8] = 0xff;
    image[fatStart + 9] = 0xff;
    image[fatStart + 10] = 0xff;
    image[fatStart + 11] = 0x0f;
  }
  return new Blob([image], { type: 'application/octet-stream' });
}
