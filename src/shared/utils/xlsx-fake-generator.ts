/**
 * this function is used to generate fake data and export it to an excel file for testing bulk add users feature
 * 
 */


import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';

// Function to generate random user data
function generateRandomUser(index: number) {
    return {
        email: `user${index}@example.com`,
        name: `User ${index}`,
        roles: 'ADMIN',
        companyName: `Company ${index}`,
        phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        location: `${Math.floor(1 + Math.random() * 100)} Elm Street, City ${index}`,
        image: '',
        // taxId: Math.random() > 0.5 ? `TAX${index}` : null,
        // isVerified: Math.random() > 0.5 ? 'VERIFIED' : 'PENDING',
        // isLocked: Math.random() > 0.5 ? 'LOCKED' : 'UNLOCKED',
    };
}

// Generate random users
const randomUsers = Array.from({ length: 10 }, (_, index) => generateRandomUser(index + 1));

// Combine specific user with random users
const data = [...randomUsers];

// Define the directory and file path
const dir = path.join(__dirname, '../../../upload/users/files');
const filePath = path.join(dir, 'users.xlsx');

// Create the directory if it doesn't exist
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Create a new workbook and a worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(data);

// Append worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

// Write the workbook to a file
XLSX.writeFile(workbook, filePath);

console.log('Excel file created successfully');
