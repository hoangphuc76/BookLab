import * as XLSX from 'xlsx';

export const readListStudentFile = async (file) => {
    try {
        // Tạo FileReader để đọc file
        const reader = new FileReader();

        // Sử dụng Promise để chờ kết quả từ FileReader
        const fileData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(new Uint8Array(e.target.result));
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });

        // Đọc file Excel và xử lý dữ liệu
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Lấy tên sheet đầu tiên
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);




        return jsonData; // Trả về kết quả
    } catch (error) {
        console.error('Error reading file:', error);
        throw error; // Ném lỗi ra ngoài để xử lý nếu cần
    }
};
