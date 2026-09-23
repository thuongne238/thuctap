// Merchandiser Dashboard Data Store
// Holds both mock datasets and SQL simulation data sets

window.DASHBOARD_DATA = {
    datasets: {
        mock: {
            kpis: {
                totalOrders: 128,
                prodOrders: 83,
                deliveredOrders: 33,
                lateOrders: 12,
                revenue: 18500000,
                otd: "92%"
            },
            revenueStats: {
                total: "18,500,000 USD",
                plan: "17,000,000 USD",
                percent: "108.8%"
            },
            revenueChart: {
                months: ['12/2023', '01/2024', '02/2024', '03/2024', '04/2024', '05/2024'],
                revenue: [8200000, 9500000, 10300000, 12100000, 15200000, 18500000],
                plan: [8000000, 9000000, 10000000, 12000000, 14500000, 17000000],
                luyKe: [8200000, 17700000, 28000000, 40100000, 55300000, 73800000],
                luyKePlan: [8000000, 17000000, 27000000, 39000000, 53500000, 70500000]
            },
            gantt: [
                { po: 'PO2405001', customer: 'DH_607|Week_09_2026_106833547', qty: '120,000', orderCode: 'ORD2405001', etd: '20/06/2024', startDate: '2024-05-01', endDate: '2024-06-20', progress: 20, status: 'slow' },
                { po: 'PO2405002', customer: 'Adidas', qty: '100,000', orderCode: 'ORD2405002', etd: '17/06/2024', startDate: '2024-05-08', endDate: '2024-06-17', progress: 35, status: 'slow' },
                { po: 'PO2405003', customer: 'Puma', qty: '80,000', orderCode: 'ORD2405003', etd: '15/06/2024', startDate: '2024-05-05', endDate: '2024-06-15', progress: 60, status: 'average' },
                { po: 'PO2405004', customer: 'Under Armour', qty: '150,000', orderCode: 'ORD2405004', etd: '25/06/2024', startDate: '2024-05-10', endDate: '2024-06-25', progress: 78, status: 'average' },
                { po: 'PO2405005', customer: 'Decathlon', qty: '70,000', orderCode: 'ORD2405005', etd: '30/06/2024', startDate: '2024-05-20', endDate: '2024-06-30', progress: 98, status: 'complete' },
                { po: 'PO2405006', customer: 'Uniqlo', qty: '95,000', orderCode: 'ORD2405006', etd: '10/07/2024', startDate: '2024-05-15', endDate: '2024-07-10', progress: 85, status: 'passed' },
                { po: 'PO2405007', customer: 'H&M', qty: '110,000', orderCode: 'ORD2405007', etd: '05/07/2024', startDate: '2024-05-25', endDate: '2024-07-05', progress: 45, status: 'slow' },
                { po: 'PO2405008', customer: 'Zara', qty: '65,000', orderCode: 'ORD2405008', etd: '22/06/2024', startDate: '2024-05-12', endDate: '2024-06-22', progress: 92, status: 'passed' },
                { po: 'PO2405009', customer: 'Target', qty: '130,000', orderCode: 'ORD2405009', etd: '15/07/2024', startDate: '2024-06-01', endDate: '2024-07-15', progress: 15, status: 'slow' },
                { po: 'PO2405010', customer: 'Gap', qty: '85,000', orderCode: 'ORD2405010', etd: '28/06/2024', startDate: '2024-05-18', endDate: '2024-06-28', progress: 55, status: 'average' },
                { po: 'PO2405011', customer: 'Columbia', qty: '40,000', orderCode: 'ORD2405011', etd: '18/07/2024', startDate: '2024-06-05', endDate: '2024-07-18', progress: 72, status: 'average' },
                { po: 'PO2405012', customer: 'Fila', qty: '50,000', orderCode: 'ORD2405012', etd: '12/06/2024', startDate: '2024-05-02', endDate: '2024-06-12', progress: 99, status: 'complete' },
                { po: 'PO2405013', customer: 'New Balance', qty: '105,000', orderCode: 'ORD2405013', etd: '24/07/2024', startDate: '2024-06-10', endDate: '2024-07-24', progress: 63, status: 'average' },
                { po: 'PO2405014', customer: 'Lululemon', qty: '75,000', orderCode: 'ORD2405014', etd: '08/07/2024', startDate: '2024-05-22', endDate: '2024-07-08', progress: 30, status: 'slow' },
                { po: 'PO2405015', customer: 'Champion', qty: '120,000', orderCode: 'ORD2405015', etd: '16/07/2024', startDate: '2024-05-28', endDate: '2024-07-16', progress: 88, status: 'passed' }
            ],
            kanban: [
                { id: 1, name: 'NPL', orders: '95 đơn hàng', progress: 95 },
                { id: 2, name: 'CẮT', orders: '90 đơn hàng', progress: 90 },
                { id: 3, name: 'MAY', orders: '85 đơn hàng', progress: 85 },
                { id: 4, name: 'HOÀN THIỆN', orders: '70 đơn hàng', progress: 70 },
                { id: 5, name: 'NHẬN TP', orders: '65 đơn hàng', progress: 65 },
                { id: 6, name: 'ĐÓNG GÓI', orders: '60 đơn hàng', progress: 60 },
                { id: 7, name: 'KIỂM HÀNG', orders: '85 đơn hàng', progress: 40 }
            ],
            wip: {
                totalPcs: '31,500 pcs',
                prodOrders: 95,
                avgCompletion: '62%',
                trendCompare: '↑ 5.2%',
                stages: [
                    { name: 'CUT (Đã cắt)', pcs: 100000, percentage: 100 },
                    { name: 'BTP (Chuẩn bị may)', pcs: 90000, percentage: 90 },
                    { name: 'SEW (May)', pcs: 72000, percentage: 72 },
                    { name: 'ENDLINE (Hoàn thiện)', pcs: 65000, percentage: 65 },
                    { name: 'Nhận thành phẩm', pcs: 58000, percentage: 58 },
                    { name: 'PACK (Đóng gói)', pcs: 50000, percentage: 50 },
                    { name: 'AQL (Kiểm hàng)', pcs: 48000, percentage: 48 },
                    { name: 'SHIP (Xuất hàng)', pcs: 25000, percentage: 25 }
                ]
            },
            wipProgressDetails: [
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574', SizeType: '0', TenMau: 'BLACK Z9', Size: 'XS', Amount: 15, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 12, NhanTP_TH: 0, FinishedIn: 12, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574', SizeType: '0', TenMau: 'BLACK Z9', Size: 'S', Amount: 10, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 9, NhanTP_TH: 6, FinishedIn: 9, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574', SizeType: '0', TenMau: 'BLACK Z9', Size: 'M', Amount: 50, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 48, NhanTP_TH: 6, FinishedIn: 48, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574', SizeType: '0', TenMau: 'BLACK Z9', Size: 'L', Amount: 60, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 56, NhanTP_TH: 19, FinishedIn: 56, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574', SizeType: '0', TenMau: 'BLACK Z9', Size: 'XL', Amount: 60, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 56, NhanTP_TH: 0, FinishedIn: 56, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574', SizeType: '0', TenMau: 'BLACK Z9', Size: '2XL', Amount: 30, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 26, NhanTP_TH: 0, FinishedIn: 26, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574', SizeType: '0', TenMau: 'BLACK Z9', Size: '3XL', Amount: 10, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 7, NhanTP_TH: 1, FinishedIn: 7, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '868', MaHang: '699000-604-Z9', PO: '5010574-VN KEEP', SizeType: '0', TenMau: 'BLACK Z9', Size: 'L', Amount: 1, RaChuyen_TH: 0, RaChuyen_LK: 236, KCS_Dat_TH: 0, KCS_Dat_LK: 0, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'TEST 1 + KEEP 1', SizeType: '0', TenMau: 'PLUM BROWN', Size: 'M', Amount: 1, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 0, KCS_Dat_LK: 0, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'TEST 1 + KEEP 1', SizeType: '0', TenMau: 'PLUM BROWN', Size: 'L', Amount: 1, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 0, KCS_Dat_LK: 0, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'GORE TEST 1 + KEEP 1', SizeType: '0', TenMau: 'STORMY BLUE', Size: 'L', Amount: 2, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 0, KCS_Dat_LK: 0, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'KEEP 1', SizeType: '0', TenMau: 'STEALTH BLACK', Size: 'L', Amount: 1, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 0, KCS_Dat_LK: 0, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'M096', SizeType: '0', TenMau: 'PLUM BROWN', Size: 'M', Amount: 1, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 0, KCS_Dat_LK: 0, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'M096', SizeType: '0', TenMau: 'PLUM BROWN', Size: 'L', Amount: 31, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 12, KCS_Dat_LK: 30, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'M096', SizeType: '0', TenMau: 'PLUM BROWN', Size: 'XL', Amount: 1, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 0, KCS_Dat_LK: 1, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'M096', SizeType: '0', TenMau: 'STEALTH BLACK', Size: 'L', Amount: 13, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 1, KCS_Dat_LK: 7, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '807', MaHang: 'M096-SMS F27', PO: 'M096', SizeType: '0', TenMau: 'STORMY BLUE', Size: 'L', Amount: 13, RaChuyen_TH: 0, RaChuyen_LK: 45, KCS_Dat_TH: 3, KCS_Dat_LK: 3, NhanTP_TH: 0, FinishedIn: 0, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 0 },
                { MaLenh: '805', MaHang: '0088 335 14 V0.0', PO: '5010641', SizeType: 'S', TenMau: 'ANTHRACITE', Size: 'S', Amount: 264, RaChuyen_TH: 0, RaChuyen_LK: 520, KCS_Dat_TH: 0, KCS_Dat_LK: 264, NhanTP_TH: 0, FinishedIn: 264, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 100 },
                { MaLenh: '805', MaHang: '0088 335 14 V0.0', PO: '5010641', SizeType: 'M', TenMau: 'ANTHRACITE', Size: 'M', Amount: 400, RaChuyen_TH: 0, RaChuyen_LK: 520, KCS_Dat_TH: 0, KCS_Dat_LK: 400, NhanTP_TH: 0, FinishedIn: 400, SLDongThung_TH: 0, SLDongThung_LK: 0, SL_AQL_TH: 0, SL_AQL_LK: 100 },
                { MaLenh: '750', MaHang: '847000-111-A1', PO: 'PO240750', SizeType: 'L', TenMau: 'NAVY BLUE', Size: 'L', Amount: 120, RaChuyen_TH: 15, RaChuyen_LK: 110, KCS_Dat_TH: 10, KCS_Dat_LK: 95, NhanTP_TH: 8, FinishedIn: 90, SLDongThung_TH: 5, SLDongThung_LK: 85, SL_AQL_TH: 0, SL_AQL_LK: 80 },
                { MaLenh: '750', MaHang: '847000-111-A1', PO: 'PO240750', SizeType: 'M', TenMau: 'NAVY BLUE', Size: 'M', Amount: 150, RaChuyen_TH: 20, RaChuyen_LK: 140, KCS_Dat_TH: 15, KCS_Dat_LK: 130, NhanTP_TH: 12, FinishedIn: 120, SLDongThung_TH: 8, SLDongThung_LK: 110, SL_AQL_TH: 0, SL_AQL_LK: 100 },
                { MaLenh: '750', MaHang: '847000-111-A1', PO: 'PO240750', SizeType: 'XL', TenMau: 'NAVY BLUE', Size: 'XL', Amount: 80, RaChuyen_TH: 10, RaChuyen_LK: 75, KCS_Dat_TH: 8, KCS_Dat_LK: 70, NhanTP_TH: 5, FinishedIn: 65, SLDongThung_TH: 2, SLDongThung_LK: 60, SL_AQL_TH: 0, SL_AQL_LK: 50 },
                { MaLenh: '742', MaHang: '109900-502-B2', PO: 'PO240742', SizeType: '0', TenMau: 'CHARCOAL', Size: 'M', Amount: 300, RaChuyen_TH: 50, RaChuyen_LK: 280, KCS_Dat_TH: 45, KCS_Dat_LK: 260, NhanTP_TH: 40, FinishedIn: 240, SLDongThung_TH: 30, SLDongThung_LK: 200, SL_AQL_TH: 25, SL_AQL_LK: 180 },
                { MaLenh: '742', MaHang: '109900-502-B2', PO: 'PO240742', SizeType: '0', TenMau: 'CHARCOAL', Size: 'L', Amount: 350, RaChuyen_TH: 60, RaChuyen_LK: 320, KCS_Dat_TH: 55, KCS_Dat_LK: 300, NhanTP_TH: 50, FinishedIn: 280, SLDongThung_TH: 40, SLDongThung_LK: 250, SL_AQL_TH: 30, SL_AQL_LK: 220 },
                { MaLenh: '730', MaHang: '235122-809-C3', PO: 'PO240730', SizeType: 'S', TenMau: 'OLIVE GREEN', Size: 'S', Amount: 180, RaChuyen_TH: 0, RaChuyen_LK: 180, KCS_Dat_TH: 0, KCS_Dat_LK: 180, NhanTP_TH: 10, FinishedIn: 175, SLDongThung_TH: 15, SLDongThung_LK: 170, SL_AQL_TH: 0, SL_AQL_LK: 165 },
                { MaLenh: '730', MaHang: '235122-809-C3', PO: 'PO240730', SizeType: 'M', TenMau: 'OLIVE GREEN', Size: 'M', Amount: 220, RaChuyen_TH: 0, RaChuyen_LK: 220, KCS_Dat_TH: 0, KCS_Dat_LK: 220, NhanTP_TH: 15, FinishedIn: 215, SLDongThung_TH: 20, SLDongThung_LK: 210, SL_AQL_TH: 0, SL_AQL_LK: 200 },
                { MaLenh: '721', MaHang: '562130-999-D4', PO: 'PO240721', SizeType: '0', TenMau: 'ROYAL BLUE', Size: 'XS', Amount: 90, RaChuyen_TH: 5, RaChuyen_LK: 85, KCS_Dat_TH: 4, KCS_Dat_LK: 80, NhanTP_TH: 2, FinishedIn: 75, SLDongThung_TH: 0, SLDongThung_LK: 70, SL_AQL_TH: 0, SL_AQL_LK: 60 },
                { MaLenh: '721', MaHang: '562130-999-D4', PO: 'PO240721', SizeType: '0', TenMau: 'ROYAL BLUE', Size: 'S', Amount: 110, RaChuyen_TH: 8, RaChuyen_LK: 105, KCS_Dat_TH: 6, KCS_Dat_LK: 100, NhanTP_TH: 4, FinishedIn: 95, SLDongThung_TH: 0, SLDongThung_LK: 90, SL_AQL_TH: 0, SL_AQL_LK: 80 },
                { MaLenh: '721', MaHang: '562130-999-D4', PO: 'PO240721', SizeType: '0', TenMau: 'ROYAL BLUE', Size: 'M', Amount: 140, RaChuyen_TH: 12, RaChuyen_LK: 135, KCS_Dat_TH: 10, KCS_Dat_LK: 130, NhanTP_TH: 8, FinishedIn: 125, SLDongThung_TH: 5, SLDongThung_LK: 120, SL_AQL_TH: 0, SL_AQL_LK: 110 },
                { MaLenh: '710', MaHang: '445012-321-E5', PO: 'PO240710', SizeType: 'L', TenMau: 'BURGUNDY', Size: 'L', Amount: 400, RaChuyen_TH: 80, RaChuyen_LK: 380, KCS_Dat_TH: 75, KCS_Dat_LK: 360, NhanTP_TH: 70, FinishedIn: 340, SLDongThung_TH: 60, SLDongThung_LK: 320, SL_AQL_TH: 50, SL_AQL_LK: 300 },
                { MaLenh: '710', MaHang: '445012-321-E5', PO: 'PO240710', SizeType: 'XL', TenMau: 'BURGUNDY', Size: 'XL', Amount: 300, RaChuyen_TH: 60, RaChuyen_LK: 280, KCS_Dat_TH: 55, KCS_Dat_LK: 260, NhanTP_TH: 50, FinishedIn: 240, SLDongThung_TH: 40, SLDongThung_LK: 220, SL_AQL_TH: 35, SL_AQL_LK: 200 },
                { MaLenh: '690', MaHang: '998231-100-F6', PO: 'PO240690', SizeType: '0', TenMau: 'WHITE GOLD', Size: 'S', Amount: 80, RaChuyen_TH: 2, RaChuyen_LK: 78, KCS_Dat_TH: 2, KCS_Dat_LK: 75, NhanTP_TH: 1, FinishedIn: 72, SLDongThung_TH: 0, SLDongThung_LK: 70, SL_AQL_TH: 0, SL_AQL_LK: 65 },
                { MaLenh: '690', MaHang: '998231-100-F6', PO: 'PO240690', SizeType: '0', TenMau: 'WHITE GOLD', Size: 'M', Amount: 100, RaChuyen_TH: 5, RaChuyen_LK: 95, KCS_Dat_TH: 4, KCS_Dat_LK: 90, NhanTP_TH: 3, FinishedIn: 88, SLDongThung_TH: 2, SLDongThung_LK: 85, SL_AQL_TH: 0, SL_AQL_LK: 80 },
                { MaLenh: '680', MaHang: '712398-444-G7', PO: 'PO240680', SizeType: 'M', TenMau: 'DARK PURPLE', Size: 'M', Amount: 210, RaChuyen_TH: 0, RaChuyen_LK: 210, KCS_Dat_TH: 0, KCS_Dat_LK: 210, NhanTP_TH: 10, FinishedIn: 205, SLDongThung_TH: 8, SLDongThung_LK: 200, SL_AQL_TH: 0, SL_AQL_LK: 190 },
                { MaLenh: '680', MaHang: '712398-444-G7', PO: 'PO240680', SizeType: 'L', TenMau: 'DARK PURPLE', Size: 'L', Amount: 240, RaChuyen_TH: 0, RaChuyen_LK: 240, KCS_Dat_TH: 0, KCS_Dat_LK: 240, NhanTP_TH: 12, FinishedIn: 235, SLDongThung_TH: 10, SLDongThung_LK: 230, SL_AQL_TH: 0, SL_AQL_LK: 220 },
                { MaLenh: '670', MaHang: '823901-002-H8', PO: 'PO240670', SizeType: '0', TenMau: 'LIME GREEN', Size: 'XS', Amount: 50, RaChuyen_TH: 1, RaChuyen_LK: 48, KCS_Dat_TH: 1, KCS_Dat_LK: 45, NhanTP_TH: 1, FinishedIn: 42, SLDongThung_TH: 0, SLDongThung_LK: 40, SL_AQL_TH: 0, SL_AQL_LK: 35 },
                { MaLenh: '670', MaHang: '823901-002-H8', PO: 'PO240670', SizeType: '0', TenMau: 'LIME GREEN', Size: 'S', Amount: 70, RaChuyen_TH: 3, RaChuyen_LK: 68, KCS_Dat_TH: 2, KCS_Dat_LK: 65, NhanTP_TH: 2, FinishedIn: 62, SLDongThung_TH: 1, SLDongThung_LK: 60, SL_AQL_TH: 0, SL_AQL_LK: 55 },
                { MaLenh: '660', MaHang: '334120-705-I9', PO: 'PO240660', SizeType: '0', TenMau: 'MUSTARD', Size: 'M', Amount: 160, RaChuyen_TH: 25, RaChuyen_LK: 150, KCS_Dat_TH: 20, KCS_Dat_LK: 145, NhanTP_TH: 15, FinishedIn: 140, SLDongThung_TH: 10, SLDongThung_LK: 130, SL_AQL_TH: 5, SL_AQL_LK: 120 },
                { MaLenh: '660', MaHang: '334120-705-I9', PO: 'PO240660', SizeType: '0', TenMau: 'MUSTARD', Size: 'L', Amount: 190, RaChuyen_TH: 30, RaChuyen_LK: 180, KCS_Dat_TH: 25, KCS_Dat_LK: 175, NhanTP_TH: 20, FinishedIn: 170, SLDongThung_TH: 15, SLDongThung_LK: 160, SL_AQL_TH: 8, SL_AQL_LK: 150 },
                { MaLenh: '650', MaHang: '124903-888-J1', PO: 'PO240650', SizeType: 'M', TenMau: 'TEAL', Size: 'M', Amount: 310, RaChuyen_TH: 40, RaChuyen_LK: 300, KCS_Dat_TH: 35, KCS_Dat_LK: 290, NhanTP_TH: 30, FinishedIn: 280, SLDongThung_TH: 20, SLDongThung_LK: 260, SL_AQL_TH: 15, SL_AQL_LK: 240 },
                { MaLenh: '650', MaHang: '124903-888-J1', PO: 'PO240650', SizeType: 'L', TenMau: 'TEAL', Size: 'L', Amount: 340, RaChuyen_TH: 45, RaChuyen_LK: 330, KCS_Dat_TH: 40, KCS_Dat_LK: 320, NhanTP_TH: 35, FinishedIn: 310, SLDongThung_TH: 25, SLDongThung_LK: 290, SL_AQL_TH: 18, SL_AQL_LK: 270 },
                { MaLenh: '640', MaHang: '556100-333-K2', PO: 'PO240640', SizeType: '0', TenMau: 'BRONZE', Size: 'L', Amount: 200, RaChuyen_TH: 0, RaChuyen_LK: 200, KCS_Dat_TH: 0, KCS_Dat_LK: 200, NhanTP_TH: 12, FinishedIn: 195, SLDongThung_TH: 10, SLDongThung_LK: 190, SL_AQL_TH: 0, SL_AQL_LK: 180 },
                { MaLenh: '630', MaHang: '772109-001-L3', PO: 'PO240630', SizeType: '0', TenMau: 'SILVER GREY', Size: 'S', Amount: 150, RaChuyen_TH: 10, RaChuyen_LK: 140, KCS_Dat_TH: 8, KCS_Dat_LK: 130, NhanTP_TH: 5, FinishedIn: 120, SLDongThung_TH: 0, SLDongThung_LK: 110, SL_AQL_TH: 0, SL_AQL_LK: 100 },
                { MaLenh: '630', MaHang: '772109-001-L3', PO: 'PO240630', SizeType: '0', TenMau: 'SILVER GREY', Size: 'M', Amount: 180, RaChuyen_TH: 15, RaChuyen_LK: 170, KCS_Dat_TH: 12, KCS_Dat_LK: 160, NhanTP_TH: 8, FinishedIn: 150, SLDongThung_TH: 2, SLDongThung_LK: 140, SL_AQL_TH: 0, SL_AQL_LK: 130 },
                { MaLenh: '620', MaHang: '990123-555-M4', PO: 'PO240620', SizeType: 'M', TenMau: 'COPPER', Size: 'M', Amount: 280, RaChuyen_TH: 35, RaChuyen_LK: 260, KCS_Dat_TH: 30, KCS_Dat_LK: 250, NhanTP_TH: 25, FinishedIn: 240, SLDongThung_TH: 20, SLDongThung_LK: 220, SL_AQL_TH: 15, SL_AQL_LK: 200 },
                { MaLenh: '620', MaHang: '990123-555-M4', PO: 'PO240620', SizeType: 'L', TenMau: 'COPPER', Size: 'L', Amount: 300, RaChuyen_TH: 40, RaChuyen_LK: 280, KCS_Dat_TH: 35, KCS_Dat_LK: 270, NhanTP_TH: 30, FinishedIn: 260, SLDongThung_TH: 25, SLDongThung_LK: 240, SL_AQL_TH: 18, SL_AQL_LK: 220 },
                { MaLenh: '610', MaHang: '443120-002-N5', PO: 'PO240610', SizeType: '0', TenMau: 'CORAL', Size: 'XS', Amount: 60, RaChuyen_TH: 2, RaChuyen_LK: 58, KCS_Dat_TH: 2, KCS_Dat_LK: 55, NhanTP_TH: 1, FinishedIn: 52, SLDongThung_TH: 0, SLDongThung_LK: 50, SL_AQL_TH: 0, SL_AQL_LK: 45 },
                { MaLenh: '610', MaHang: '443120-002-N5', PO: 'PO240610', SizeType: '0', TenMau: 'CORAL', Size: 'S', Amount: 80, RaChuyen_TH: 4, RaChuyen_LK: 76, KCS_Dat_TH: 3, KCS_Dat_LK: 72, NhanTP_TH: 2, FinishedIn: 68, SLDongThung_TH: 1, SLDongThung_LK: 65, SL_AQL_TH: 0, SL_AQL_LK: 60 },
                { MaLenh: '600', MaHang: '887123-444-O6', PO: 'PO240600', SizeType: '0', TenMau: 'AQUA', Size: 'M', Amount: 230, RaChuyen_TH: 30, RaChuyen_LK: 220, KCS_Dat_TH: 25, KCS_Dat_LK: 210, NhanTP_TH: 20, FinishedIn: 200, SLDongThung_TH: 15, SLDongThung_LK: 180, SL_AQL_TH: 10, SL_AQL_LK: 170 },
                { MaLenh: '600', MaHang: '887123-444-O6', PO: 'PO240600', SizeType: '0', TenMau: 'AQUA', Size: 'L', Amount: 260, RaChuyen_TH: 35, RaChuyen_LK: 250, KCS_Dat_TH: 30, KCS_Dat_LK: 240, NhanTP_TH: 25, FinishedIn: 230, SLDongThung_TH: 20, SLDongThung_LK: 210, SL_AQL_TH: 12, SL_AQL_LK: 200 },
                { MaLenh: '590', MaHang: '112930-100-P7', PO: 'PO240590', SizeType: 'S', TenMau: 'SAND', Size: 'S', Amount: 140, RaChuyen_TH: 0, RaChuyen_LK: 140, KCS_Dat_TH: 0, KCS_Dat_LK: 140, NhanTP_TH: 8, FinishedIn: 135, SLDongThung_TH: 5, SLDongThung_LK: 130, SL_AQL_TH: 0, SL_AQL_LK: 120 },
                { MaLenh: '590', MaHang: '112930-100-P7', PO: 'PO240590', SizeType: 'M', TenMau: 'SAND', Size: 'M', Amount: 170, RaChuyen_TH: 0, RaChuyen_LK: 170, KCS_Dat_TH: 0, KCS_Dat_LK: 170, NhanTP_TH: 12, FinishedIn: 165, SLDongThung_TH: 10, SLDongThung_LK: 160, SL_AQL_TH: 0, SL_AQL_LK: 150 },
                { MaLenh: '580', MaHang: '556122-888-Q8', PO: 'PO240580', SizeType: '0', TenMau: 'KHAKI', Size: 'M', Amount: 330, RaChuyen_TH: 55, RaChuyen_LK: 310, KCS_Dat_TH: 50, KCS_Dat_LK: 300, NhanTP_TH: 45, FinishedIn: 290, SLDongThung_TH: 35, SLDongThung_LK: 270, SL_AQL_TH: 30, SL_AQL_LK: 250 },
                { MaLenh: '580', MaHang: '556122-888-Q8', PO: 'PO240580', SizeType: '0', TenMau: 'KHAKI', Size: 'L', Amount: 370, RaChuyen_TH: 60, RaChuyen_LK: 350, KCS_Dat_TH: 55, KCS_Dat_LK: 340, NhanTP_TH: 50, FinishedIn: 330, SLDongThung_TH: 40, SLDongThung_LK: 310, SL_AQL_TH: 35, SL_AQL_LK: 290 },
                { MaLenh: '570', MaHang: '774130-999-R9', PO: 'PO240570', SizeType: 'L', TenMau: 'MUSTARD GOLD', Size: 'L', Amount: 190, RaChuyen_TH: 15, RaChuyen_LK: 180, KCS_Dat_TH: 12, KCS_Dat_LK: 170, NhanTP_TH: 10, FinishedIn: 160, SLDongThung_TH: 5, SLDongThung_LK: 150, SL_AQL_TH: 0, SL_AQL_LK: 140 },
                { MaLenh: '570', MaHang: '774130-999-R9', PO: 'PO240570', SizeType: 'XL', TenMau: 'MUSTARD GOLD', Size: 'XL', Amount: 150, RaChuyen_TH: 10, RaChuyen_LK: 140, KCS_Dat_TH: 8, KCS_Dat_LK: 130, NhanTP_TH: 6, FinishedIn: 120, SLDongThung_TH: 2, SLDongThung_LK: 110, SL_AQL_TH: 0, SL_AQL_LK: 100 },
                { MaLenh: '560', MaHang: '235099-002-S1', PO: 'PO240560', SizeType: '0', TenMau: 'CREAM', Size: 'S', Amount: 95, RaChuyen_TH: 5, RaChuyen_LK: 90, KCS_Dat_TH: 4, KCS_Dat_LK: 85, NhanTP_TH: 3, FinishedIn: 80, SLDongThung_TH: 0, SLDongThung_LK: 75, SL_AQL_TH: 0, SL_AQL_LK: 70 },
                { MaLenh: '560', MaHang: '235099-002-S1', PO: 'PO240560', SizeType: '0', TenMau: 'CREAM', Size: 'M', Amount: 125, RaChuyen_TH: 8, RaChuyen_LK: 120, KCS_Dat_TH: 6, KCS_Dat_LK: 115, NhanTP_TH: 4, FinishedIn: 110, SLDongThung_TH: 2, SLDongThung_LK: 105, SL_AQL_TH: 0, SL_AQL_LK: 100 }
            ],
            wipDetails: {
                'CUT': [
                    { Chuyen: 'Tổ Cắt 1', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 2000 },
                    { Chuyen: 'Tổ Cắt 2', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 3000 },
                    { Chuyen: 'Tổ Cắt 1', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 1500 },
                    { Chuyen: 'Tổ Cắt 1', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 1000 },
                    { Chuyen: 'Tổ Cắt 2', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 2500 },
                    { Chuyen: 'Tổ Cắt 3', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 4000 },
                    { Chuyen: 'Tổ Cắt 3', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 3000 },
                    { Chuyen: 'Tổ Cắt 1', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 1500 },
                    { Chuyen: 'Tổ Cắt 2', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 800 },
                    { Chuyen: 'Tổ Cắt 1', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 6000 },
                    { Chuyen: 'Tổ Cắt 2', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 5000 },
                    { Chuyen: 'Tổ Cắt 3', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 4500 },
                    { Chuyen: 'Tổ Cắt 3', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 2000 }
                ],
                'BTP': [
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 1800 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 2500 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 1200 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 900 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 2200 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 3500 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 2800 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 1400 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 700 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 5500 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 4500 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 4000 },
                    { Chuyen: 'Kho BTP', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 1800 }
                ],
                'SEW': [
                    { Chuyen: 'Chuyền 1', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 1500 },
                    { Chuyen: 'Chuyền 3', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 2000 },
                    { Chuyen: 'Chuyền 2', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 1000 },
                    { Chuyen: 'Chuyền 1', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 800 },
                    { Chuyen: 'Chuyền 2', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 1800 },
                    { Chuyen: 'Chuyền 3', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 3000 },
                    { Chuyen: 'Chuyền 1', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 2200 },
                    { Chuyen: 'Chuyền 2', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 1200 },
                    { Chuyen: 'Chuyền 3', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 600 },
                    { Chuyen: 'Chuyền 1', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 4500 },
                    { Chuyen: 'Chuyền 2', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 3800 },
                    { Chuyen: 'Chuyền 3', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 3200 },
                    { Chuyen: 'Chuyền 1', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 1500 }
                ],
                'ENDLINE': [
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 1300 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 1800 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 900 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 700 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 1600 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 2800 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 2000 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 1100 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 500 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 4000 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 3500 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 3000 },
                    { Chuyen: 'Tổ Hoàn Thiện', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 1300 }
                ],
                'NHAN_TP': [
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 1200 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 1700 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 800 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 650 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 1500 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 2700 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 1900 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 1050 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 450 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 3800 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 3200 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 2800 },
                    { Chuyen: 'Tổ Nhận TP', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 1200 }
                ],
                'PACK': [
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 1000 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 1500 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 700 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 600 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 1400 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 2500 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 1800 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 1000 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 400 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 3500 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 3000 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 2500 },
                    { Chuyen: 'Tổ Đóng Gói', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 1000 }
                ],
                'AQL': [
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 900 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 1400 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 600 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 500 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 1300 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 2300 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 1600 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 900 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 350 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 3200 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 2800 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 2300 },
                    { Chuyen: 'Tổ QA/KCS', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 900 }
                ],
                'SHIP': [
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'M', SLKH: 10000, SLTH: 500 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'S', SLKH: 12000, SLTH: 800 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'L', SLKH: 8000, SLTH: 300 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405001', NhomSize: 'Men', Mau: 'Black', Size: 'L', SLKH: 5000, SLTH: 250 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-001', MaHang: 'STYLE_001', PO: 'PO2405004', NhomSize: 'Men', Mau: 'Blue', Size: 'M', SLKH: 8000, SLTH: 600 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'M', SLKH: 6000, SLTH: 1200 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-004', MaHang: 'STYLE_004', PO: 'PO2405005', NhomSize: 'Women', Mau: 'Pink', Size: 'S', SLKH: 4000, SLTH: 800 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405002', NhomSize: 'Women', Mau: 'White', Size: 'M', SLKH: 10000, SLTH: 450 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405003', NhomSize: 'Kids', Mau: 'Red', Size: 'M', SLKH: 7000, SLTH: 150 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'XL', SLKH: 15000, SLTH: 1800 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-005', MaHang: 'STYLE_005', PO: 'PO2405006', NhomSize: 'Men', Mau: 'Grey', Size: 'L', SLKH: 12000, SLTH: 1400 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-002', MaHang: 'STYLE_002', PO: 'PO2405007', NhomSize: 'Women', Mau: 'Yellow', Size: 'M', SLKH: 9000, SLTH: 1100 },
                    { Chuyen: 'Máng Xuất Hàng', MaLenh: 'LSX-003', MaHang: 'STYLE_003', PO: 'PO2405008', NhomSize: 'Kids', Mau: 'Green', Size: 'S', SLKH: 5000, SLTH: 450 }
                ]
            },
            materials: [
                { type: 'Vải chính', demand: 5000, available: 5000, pct: 100, status: 'active' },
                { type: 'Vải lót', demand: 3000, available: 3000, pct: 100, status: 'active' },
                { type: 'Chỉ may', demand: 200, available: 180, pct: 90, status: 'warning' },
                { type: 'Phụ liệu', demand: 1000, available: 700, pct: 70, status: 'warning' },
                { type: 'Tem nhãn', demand: 100000, available: 40000, pct: 40, status: 'critical' },
                { type: 'Bao bì', demand: 10000, available: 0, pct: 0, status: 'critical' }
            ],
            riskOrders: [
                { po: 'PO2405003', customer: 'Puma', score: 75, reason: 'Cắt chậm, NPL thiếu', etd: '15/06/2024' },
                { po: 'PO2405004', customer: 'Under Armour', score: 60, reason: 'Endline chậm', etd: '25/06/2024' },
                { po: 'PO2405002', customer: 'Adidas', score: 50, reason: 'NPL tem trễ', etd: '17/06/2024' },
                { po: 'PO2405005', customer: 'Decathlon', score: 45, reason: 'May chậm', etd: '30/06/2024' },
                { po: 'PO2405001', customer: 'DH_607|Week_09_2026_106833547', score: 35, reason: 'AQL pending', etd: '20/06/2024' }
            ],
            overallCompletion: 65,
            customerRevenue: [
                { name: 'DH_607|Week_09_2026_106833547', value: 7200000, pct: '39%', color: 'var(--color-cust-rank1)' },
                { name: 'Adidas', value: 5100000, pct: '28%', color: 'var(--color-cust-rank2)' },
                { name: 'Puma', value: 3000000, pct: '16%', color: 'var(--color-cust-rank3)' },
                { name: 'Under Armour', value: 1900000, pct: '10%', color: 'var(--color-cust-rank4)' },
                { name: 'Decathlon', value: 1300000, pct: '7%', color: 'var(--color-cust-rank5)' },
                { name: 'Khác', value: 300000, pct: '2%', color: 'var(--color-cust-other)' }
            ],
            purchaseTracking: {
                summary: { ordered: 161, arrived: 105, incoming: 38, fail: 18 },
                items: [
                    { itemCode: 'Vải chính', poOrdered: 20, poArrived: 16, poIncoming: 3, poFail: 1 },
                    { itemCode: 'Vải lót', poOrdered: 14, poArrived: 10, poIncoming: 3, poFail: 1 },
                    { itemCode: 'Chỉ may', poOrdered: 15, poArrived: 8, poIncoming: 5, poFail: 2 },
                    { itemCode: 'Nút áo', poOrdered: 8, poArrived: 5, poIncoming: 2, poFail: 1 },
                    { itemCode: 'Dây kéo', poOrdered: 5, poArrived: 2, poIncoming: 2, poFail: 1 },
                    { itemCode: 'Tem nhãn', poOrdered: 9, poArrived: 6, poIncoming: 2, poFail: 1 },
                    { itemCode: 'ZIPPER', poOrdered: 12, poArrived: 8, poIncoming: 3, poFail: 1 },
                    { itemCode: 'REFLEX', poOrdered: 8, poArrived: 5, poIncoming: 2, poFail: 1 },
                    { itemCode: 'SLIDER', poOrdered: 6, poArrived: 4, poIncoming: 1, poFail: 1 },
                    { itemCode: 'PULLER', poOrdered: 8, poArrived: 5, poIncoming: 2, poFail: 1 },
                    { itemCode: 'SNAP BUTTON', poOrdered: 9, poArrived: 6, poIncoming: 2, poFail: 1 },
                    { itemCode: 'PLASTIC BUTTON', poOrdered: 8, poArrived: 5, poIncoming: 2, poFail: 1 },
                    { itemCode: 'VELCRO', poOrdered: 7, poArrived: 4, poIncoming: 2, poFail: 1 },
                    { itemCode: 'Chun quần', poOrdered: 9, poArrived: 6, poIncoming: 2, poFail: 1 },
                    { itemCode: 'Mex dựng', poOrdered: 11, poArrived: 7, poIncoming: 3, poFail: 1 },
                    { itemCode: 'Bao bì', poOrdered: 12, poArrived: 8, poIncoming: 2, poFail: 2 }
                ]
            },
            poDetails: {
                'PO2405001': [
                    { POID: 'PO2405001', MaHang: 'STYLE_959', TenMau: 'Màu Vàng', Size: 'S', SLKH: 25000, SLTH: 5000 },
                    { POID: 'PO2405001', MaHang: 'STYLE_959', TenMau: 'Màu Vàng', Size: 'M', SLKH: 20000, SLTH: 4000 },
                    { POID: 'PO2405001', MaHang: 'STYLE_959', TenMau: 'Màu Vàng', Size: 'L', SLKH: 15000, SLTH: 3000 },
                    { POID: 'PO2405001', MaHang: 'STYLE_959', TenMau: 'Màu Xanh', Size: 'S', SLKH: 25000, SLTH: 5000 },
                    { POID: 'PO2405001', MaHang: 'STYLE_959', TenMau: 'Màu Xanh', Size: 'M', SLKH: 20000, SLTH: 4000 },
                    { POID: 'PO2405001', MaHang: 'STYLE_959', TenMau: 'Màu Xanh', Size: 'L', SLKH: 15000, SLTH: 3000 }
                ],
                'PO2405002': [
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Vàng', Size: 'S', SLKH: 14000, SLTH: 5000 },
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Vàng', Size: 'M', SLKH: 11000, SLTH: 4000 },
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Vàng', Size: 'L', SLKH: 11000, SLTH: 4000 },
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Vàng', Size: 'XL', SLKH: 6000, SLTH: 2000 },
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Đỏ', Size: 'S', SLKH: 17000, SLTH: 6000 },
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Đỏ', Size: 'M', SLKH: 14000, SLTH: 5000 },
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Đỏ', Size: 'L', SLKH: 14000, SLTH: 5000 },
                    { POID: 'PO2405002', MaHang: 'STYLE_110', TenMau: 'Màu Đỏ', Size: 'XL', SLKH: 13000, SLTH: 4000 }
                ],
                'PO2405003': [
                    { POID: 'PO2405003', MaHang: 'STYLE_875', TenMau: 'Màu Xanh', Size: 'S', SLKH: 16000, SLTH: 10000 },
                    { POID: 'PO2405003', MaHang: 'STYLE_875', TenMau: 'Màu Xanh', Size: 'M', SLKH: 13000, SLTH: 8000 },
                    { POID: 'PO2405003', MaHang: 'STYLE_875', TenMau: 'Màu Xanh', Size: 'L', SLKH: 11000, SLTH: 6000 },
                    { POID: 'PO2405003', MaHang: 'STYLE_875', TenMau: 'Màu Đen', Size: 'S', SLKH: 16000, SLTH: 10000 },
                    { POID: 'PO2405003', MaHang: 'STYLE_875', TenMau: 'Màu Đen', Size: 'M', SLKH: 13000, SLTH: 8000 },
                    { POID: 'PO2405003', MaHang: 'STYLE_875', TenMau: 'Màu Đen', Size: 'L', SLKH: 11000, SLTH: 6000 }
                ],
                'PO2405004': [
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Trắng', Size: 'S', SLKH: 25000, SLTH: 20000 },
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Trắng', Size: 'M', SLKH: 19000, SLTH: 15000 },
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Trắng', Size: 'L', SLKH: 19000, SLTH: 15000 },
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Trắng', Size: 'XL', SLKH: 13000, SLTH: 10000 },
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Đen', Size: 'S', SLKH: 25000, SLTH: 20000 },
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Đen', Size: 'M', SLKH: 19000, SLTH: 15000 },
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Đen', Size: 'L', SLKH: 17000, SLTH: 12000 },
                    { POID: 'PO2405004', MaHang: 'STYLE_230', TenMau: 'Màu Đen', Size: 'XL', SLKH: 13000, SLTH: 10000 }
                ],
                'PO2405005': [
                    { POID: 'PO2405005', MaHang: 'STYLE_402', TenMau: 'Màu Vàng', Size: 'S', SLKH: 15300, SLTH: 15000 },
                    { POID: 'PO2405005', MaHang: 'STYLE_402', TenMau: 'Màu Vàng', Size: 'M', SLKH: 10200, SLTH: 10000 },
                    { POID: 'PO2405005', MaHang: 'STYLE_402', TenMau: 'Màu Vàng', Size: 'L', SLKH: 9500, SLTH: 9300 },
                    { POID: 'PO2405005', MaHang: 'STYLE_402', TenMau: 'Màu Đỏ', Size: 'S', SLKH: 15300, SLTH: 15000 },
                    { POID: 'PO2405005', MaHang: 'STYLE_402', TenMau: 'Màu Đỏ', Size: 'M', SLKH: 10200, SLTH: 10000 },
                    { POID: 'PO2405005', MaHang: 'STYLE_402', TenMau: 'Màu Đỏ', Size: 'L', SLKH: 9500, SLTH: 9300 }
                ],
                'PO2405006': [
                    { POID: 'PO2405006', MaHang: 'STYLE_605', TenMau: 'Màu Xanh', Size: 'S', SLKH: 17500, SLTH: 15000 },
                    { POID: 'PO2405006', MaHang: 'STYLE_605', TenMau: 'Màu Xanh', Size: 'M', SLKH: 17500, SLTH: 15000 },
                    { POID: 'PO2405006', MaHang: 'STYLE_605', TenMau: 'Màu Xanh', Size: 'L', SLKH: 12500, SLTH: 10375 },
                    { POID: 'PO2405006', MaHang: 'STYLE_605', TenMau: 'Màu Trắng', Size: 'S', SLKH: 17500, SLTH: 15000 },
                    { POID: 'PO2405006', MaHang: 'STYLE_605', TenMau: 'Màu Trắng', Size: 'M', SLKH: 17500, SLTH: 15000 },
                    { POID: 'PO2405006', MaHang: 'STYLE_605', TenMau: 'Màu Trắng', Size: 'L', SLKH: 12500, SLTH: 10375 }
                ],
                'PO2405007': [
                    { POID: 'PO2405007', MaHang: 'STYLE_709', TenMau: 'Màu Đỏ', Size: 'S', SLKH: 22000, SLTH: 10000 },
                    { POID: 'PO2405007', MaHang: 'STYLE_709', TenMau: 'Màu Đỏ', Size: 'M', SLKH: 18000, SLTH: 8000 },
                    { POID: 'PO2405007', MaHang: 'STYLE_709', TenMau: 'Màu Đỏ', Size: 'L', SLKH: 15000, SLTH: 6750 },
                    { POID: 'PO2405007', MaHang: 'STYLE_709', TenMau: 'Màu Vàng', Size: 'S', SLKH: 22000, SLTH: 10000 },
                    { POID: 'PO2405007', MaHang: 'STYLE_709', TenMau: 'Màu Vàng', Size: 'M', SLKH: 18000, SLTH: 8000 },
                    { POID: 'PO2405007', MaHang: 'STYLE_709', TenMau: 'Màu Vàng', Size: 'L', SLKH: 15000, SLTH: 6750 }
                ],
                'PO2405008': [
                    { POID: 'PO2405008', MaHang: 'STYLE_112', TenMau: 'Màu Đen', Size: 'S', SLKH: 16000, SLTH: 15000 },
                    { POID: 'PO2405008', MaHang: 'STYLE_112', TenMau: 'Màu Đen', Size: 'M', SLKH: 16500, SLTH: 14900 },
                    { POID: 'PO2405008', MaHang: 'STYLE_112', TenMau: 'Màu Trắng', Size: 'S', SLKH: 16000, SLTH: 15000 },
                    { POID: 'PO2405008', MaHang: 'STYLE_112', TenMau: 'Màu Trắng', Size: 'M', SLKH: 16500, SLTH: 14900 }
                ],
                'PO2405009': [
                    { POID: 'PO2405009', MaHang: 'STYLE_889', TenMau: 'Màu Vàng', Size: 'S', SLKH: 33000, SLTH: 5000 },
                    { POID: 'PO2405009', MaHang: 'STYLE_889', TenMau: 'Màu Vàng', Size: 'M', SLKH: 32000, SLTH: 4750 },
                    { POID: 'PO2405009', MaHang: 'STYLE_889', TenMau: 'Màu Xanh', Size: 'S', SLKH: 33000, SLTH: 5000 },
                    { POID: 'PO2405009', MaHang: 'STYLE_889', TenMau: 'Màu Xanh', Size: 'M', SLKH: 32000, SLTH: 4750 }
                ],
                'PO2405010': [
                    { POID: 'PO2405010', MaHang: 'STYLE_332', TenMau: 'Màu Đỏ', Size: 'S', SLKH: 22000, SLTH: 12000 },
                    { POID: 'PO2405010', MaHang: 'STYLE_332', TenMau: 'Màu Đỏ', Size: 'M', SLKH: 20500, SLTH: 11375 },
                    { POID: 'PO2405010', MaHang: 'STYLE_332', TenMau: 'Màu Đen', Size: 'S', SLKH: 22000, SLTH: 12000 },
                    { POID: 'PO2405010', MaHang: 'STYLE_332', TenMau: 'Màu Đen', Size: 'M', SLKH: 20500, SLTH: 11375 }
                ],
                'PO2405011': [
                    { POID: 'PO2405011', MaHang: 'STYLE_441', TenMau: 'Màu Trắng', Size: 'S', SLKH: 11000, SLTH: 8000 },
                    { POID: 'PO2405011', MaHang: 'STYLE_441', TenMau: 'Màu Trắng', Size: 'M', SLKH: 9000, SLTH: 6400 },
                    { POID: 'PO2405011', MaHang: 'STYLE_441', TenMau: 'Màu Xanh', Size: 'S', SLKH: 11000, SLTH: 8000 },
                    { POID: 'PO2405011', MaHang: 'STYLE_441', TenMau: 'Màu Xanh', Size: 'M', SLKH: 9000, SLTH: 6400 }
                ],
                'PO2405012': [
                    { POID: 'PO2405012', MaHang: 'STYLE_512', TenMau: 'Màu Đen', Size: 'S', SLKH: 13100, SLTH: 13000 },
                    { POID: 'PO2405012', MaHang: 'STYLE_512', TenMau: 'Màu Đen', Size: 'M', SLKH: 11900, SLTH: 11750 },
                    { POID: 'PO2405012', MaHang: 'STYLE_512', TenMau: 'Màu Vàng', Size: 'S', SLKH: 13100, SLTH: 13000 },
                    { POID: 'PO2405012', MaHang: 'STYLE_512', TenMau: 'Màu Vàng', Size: 'M', SLKH: 11900, SLTH: 11750 }
                ],
                'PO2405013': [
                    { POID: 'PO2405013', MaHang: 'STYLE_223', TenMau: 'Màu Đỏ', Size: 'S', SLKH: 29000, SLTH: 18000 },
                    { POID: 'PO2405013', MaHang: 'STYLE_223', TenMau: 'Màu Đỏ', Size: 'M', SLKH: 23500, SLTH: 15075 },
                    { POID: 'PO2405013', MaHang: 'STYLE_223', TenMau: 'Màu Trắng', Size: 'S', SLKH: 29000, SLTH: 18000 },
                    { POID: 'PO2405013', MaHang: 'STYLE_223', TenMau: 'Màu Trắng', Size: 'M', SLKH: 23500, SLTH: 15075 }
                ],
                'PO2405014': [
                    { POID: 'PO2405014', MaHang: 'STYLE_904', TenMau: 'Màu Xanh', Size: 'S', SLKH: 20000, SLTH: 6000 },
                    { POID: 'PO2405014', MaHang: 'STYLE_904', TenMau: 'Màu Xanh', Size: 'M', SLKH: 17500, SLTH: 5250 },
                    { POID: 'PO2405014', MaHang: 'STYLE_904', TenMau: 'Màu Đen', Size: 'S', SLKH: 20000, SLTH: 6000 },
                    { POID: 'PO2405014', MaHang: 'STYLE_904', TenMau: 'Màu Đen', Size: 'M', SLKH: 17500, SLTH: 5250 }
                ],
                'PO2405015': [
                    { POID: 'PO2405015', MaHang: 'STYLE_339', TenMau: 'Màu Vàng', Size: 'S', SLKH: 34000, SLTH: 30000 },
                    { POID: 'PO2405015', MaHang: 'STYLE_339', TenMau: 'Màu Vàng', Size: 'M', SLKH: 26000, SLTH: 22800 },
                    { POID: 'PO2405015', MaHang: 'STYLE_339', TenMau: 'Màu Đỏ', Size: 'S', SLKH: 34000, SLTH: 30000 },
                    { POID: 'PO2405015', MaHang: 'STYLE_339', TenMau: 'Màu Đỏ', Size: 'M', SLKH: 26000, SLTH: 22800 }
                ]
            },
            purchaseDetails: [
                { POID: 'PO2405001', MaHang: 'STYLE_959', TenNPL: 'Vải Cotton Trắng', NhaCungCap: 'Song Hong Garment', SoLuong: 5000, DonViTinh: 'm', NgayDuKien: '2026-06-15T00:00:00', TrangThai: 'arrived', MaCLVT: 'Vải chính', KhachHang: 'Decathlon' },
                { POID: 'PO2405002', MaHang: 'STYLE_110', TenNPL: 'Vải Polyester Đen', NhaCungCap: 'Phong Phu Fabric', SoLuong: 8000, DonViTinh: 'm', NgayDuKien: '2026-06-16T00:00:00', TrangThai: 'arrived', MaCLVT: 'Vải chính', KhachHang: 'Adidas' },
                { POID: 'PO2405003', MaHang: 'STYLE_875', TenNPL: 'Vải chính Reflex Orange', NhaCungCap: 'Formosa Textile', SoLuong: 3500, DonViTinh: 'm', NgayDuKien: '2026-07-20T00:00:00', TrangThai: 'ordered', MaCLVT: 'Vải chính', KhachHang: 'Puma' },
                { POID: 'PO2405004', MaHang: 'STYLE_230', TenNPL: 'Vải chính Reflex Blue', NhaCungCap: 'Formosa Textile', SoLuong: 4500, DonViTinh: 'm', NgayDuKien: '2026-07-28T00:00:00', TrangThai: 'incoming', MaCLVT: 'Vải chính', KhachHang: 'Nike' },
                { POID: 'PO2405013', MaHang: 'STYLE_959', TenNPL: 'Vải Kaki Thun', NhaCungCap: 'Song Hong Garment', SoLuong: 2500, DonViTinh: 'm', NgayDuKien: '2026-06-05T00:00:00', TrangThai: 'fail', MaCLVT: 'Vải chính', KhachHang: 'Decathlon' },
                { POID: 'PO2405005', MaHang: 'STYLE_339', TenNPL: 'Vải lót Mesh Lining Black', NhaCungCap: 'Dong Xuan Knitwear', SoLuong: 4000, DonViTinh: 'm', NgayDuKien: '2026-06-10T00:00:00', TrangThai: 'arrived', MaCLVT: 'Vải lót', KhachHang: 'Under Armour' },
                { POID: 'PO2405006', MaHang: 'STYLE_512', TenNPL: 'Vải lót Mesh Lining White', NhaCungCap: 'Dong Xuan Knitwear', SoLuong: 3000, DonViTinh: 'm', NgayDuKien: '2026-07-22T00:00:00', TrangThai: 'ordered', MaCLVT: 'Vải lót', KhachHang: 'Decathlon' },
                { POID: 'PO2405007', MaHang: 'STYLE_441', TenNPL: 'Chỉ may Coats Phong Phu 40/2', NhaCungCap: 'Coats Phong Phu', SoLuong: 200, DonViTinh: 'kg', NgayDuKien: '2026-06-12T00:00:00', TrangThai: 'arrived', MaCLVT: 'Chỉ may', KhachHang: 'VKDK' },
                { POID: 'PO2405008', MaHang: 'STYLE_223', TenNPL: 'Chỉ may Coats Phong Phu 50/2', NhaCungCap: 'Coats Phong Phu', SoLuong: 150, DonViTinh: 'kg', NgayDuKien: '2026-07-10T00:00:00', TrangThai: 'ordered', MaCLVT: 'Chỉ may', KhachHang: 'MSA' },
                { POID: 'PO2405014', MaHang: 'STYLE_441', TenNPL: 'Chỉ may Coats 40/2 Black', NhaCungCap: 'Coats Phong Phu', SoLuong: 100, DonViTinh: 'kg', NgayDuKien: '2026-06-01T00:00:00', TrangThai: 'fail', MaCLVT: 'Chỉ may', KhachHang: 'VKDK' },
                { POID: 'PO2405015', MaHang: 'STYLE_223', TenNPL: 'Chỉ nylon trắng', NhaCungCap: 'Coats Phong Phu', SoLuong: 80, DonViTinh: 'kg', NgayDuKien: '2026-06-03T00:00:00', TrangThai: 'fail', MaCLVT: 'Chỉ may', KhachHang: 'MSA' },
                { POID: 'PO2405009', MaHang: 'STYLE_889', TenNPL: 'Dây khóa kéo YKK 20cm', NhaCungCap: 'YKK Vietnam', SoLuong: 1200, DonViTinh: 'pcs', NgayDuKien: '2026-06-25T00:00:00', TrangThai: 'arrived', MaCLVT: 'Dây kéo', KhachHang: 'Decathlon' },
                { POID: 'PO2405010', MaHang: 'STYLE_332', TenNPL: 'Dây khóa kéo YKK 30cm', NhaCungCap: 'YKK Vietnam', SoLuong: 1000, DonViTinh: 'pcs', NgayDuKien: '2026-07-05T00:00:00', TrangThai: 'ordered', MaCLVT: 'Dây kéo', KhachHang: 'Adidas' },
                { POID: 'PO2405016', MaHang: 'STYLE_889', TenNPL: 'Dây khóa kéo YKK 15cm', NhaCungCap: 'YKK Vietnam', SoLuong: 800, DonViTinh: 'pcs', NgayDuKien: '2026-06-02T00:00:00', TrangThai: 'fail', MaCLVT: 'Dây kéo', KhachHang: 'Decathlon' },
                { POID: 'PO2405011', MaHang: 'STYLE_441', TenNPL: 'Nút nhựa Plastic Button 15mm', NhaCungCap: 'Nha Be Accessories', SoLuong: 6000, DonViTinh: 'pcs', NgayDuKien: '2026-06-20T00:00:00', TrangThai: 'arrived', MaCLVT: 'Nút áo', KhachHang: 'Puma' },
                { POID: 'PO2405012', MaHang: 'STYLE_512', TenNPL: 'Tem nhãn nhãn cổ Decathlon', NhaCungCap: 'Decathlon Vietnam', SoLuong: 5000, DonViTinh: 'pcs', NgayDuKien: '2026-07-18T00:00:00', TrangThai: 'ordered', MaCLVT: 'Tem nhãn', KhachHang: 'Decathlon' },
                { POID: 'PO2405017', MaHang: 'STYLE_512', TenNPL: 'Tem nhãn Decathlon White', NhaCungCap: 'Decathlon Vietnam', SoLuong: 3000, DonViTinh: 'pcs', NgayDuKien: '2026-06-04T00:00:00', TrangThai: 'fail', MaCLVT: 'Tem nhãn', KhachHang: 'Decathlon' },
                { POID: 'PO2405018', MaHang: 'STYLE_605', TenNPL: 'Nút nhựa xà cừ', NhaCungCap: 'Phong Phu Accessories', SoLuong: 12000, DonViTinh: 'pcs', NgayDuKien: '2026-07-15T00:00:00', TrangThai: 'ordered', MaCLVT: 'Nút áo', KhachHang: 'Uniqlo' },
                { POID: 'PO2405019', MaHang: 'STYLE_709', TenNPL: 'Nút bấm kim loại', NhaCungCap: 'Duy Cuong Metal', SoLuong: 8000, DonViTinh: 'pcs', NgayDuKien: '2026-07-10T00:00:00', TrangThai: 'incoming', MaCLVT: 'Nút áo', KhachHang: 'H&M' },
                { POID: 'PO2405020', MaHang: 'STYLE_112', TenNPL: 'Nút áo sơ mi 10mm', NhaCungCap: 'Nha Be Accessories', SoLuong: 15000, DonViTinh: 'pcs', NgayDuKien: '2026-06-08T00:00:00', TrangThai: 'fail', MaCLVT: 'Nút áo', KhachHang: 'Zara' },
                { POID: 'PO2405021', MaHang: 'STYLE_889', TenNPL: 'Tem nhãn sườn H&M', NhaCungCap: 'Label Viet', SoLuong: 10000, DonViTinh: 'pcs', NgayDuKien: '2026-06-20T00:00:00', TrangThai: 'arrived', MaCLVT: 'Tem nhãn', KhachHang: 'H&M' },
                { POID: 'PO2405022', MaHang: 'STYLE_332', TenNPL: 'Nhãn size Satin', NhaCungCap: 'Dong A Label', SoLuong: 5000, DonViTinh: 'pcs', NgayDuKien: '2026-07-12T00:00:00', TrangThai: 'incoming', MaCLVT: 'Tem nhãn', KhachHang: 'Gap' },
                { POID: 'PO2405023', MaHang: 'STYLE_441', TenNPL: 'Chỉ thêu Hexcel', NhaCungCap: 'Coats Phong Phu', SoLuong: 120, DonViTinh: 'kg', NgayDuKien: '2026-07-25T00:00:00', TrangThai: 'incoming', MaCLVT: 'Chỉ may', KhachHang: 'Nike' },
                { POID: 'PO2405024', MaHang: 'STYLE_512', TenNPL: 'Vải lót Fleece', NhaCungCap: 'Dong Xuan Knitwear', SoLuong: 2000, DonViTinh: 'm', NgayDuKien: '2026-07-18T00:00:00', TrangThai: 'incoming', MaCLVT: 'Vải lót', KhachHang: 'Adidas' },
                { POID: 'PO2405025', MaHang: 'STYLE_223', TenNPL: 'Vải lót Tricot', NhaCungCap: 'Formosa Textile', SoLuong: 1500, DonViTinh: 'm', NgayDuKien: '2026-06-02T00:00:00', TrangThai: 'fail', MaCLVT: 'Vải lót', KhachHang: 'Zara' },
                { POID: 'PO2405026', MaHang: 'STYLE_904', TenNPL: 'Dây kéo giọt nước 18cm', NhaCungCap: 'YKK Vietnam', SoLuong: 2500, DonViTinh: 'pcs', NgayDuKien: '2026-07-14T00:00:00', TrangThai: 'incoming', MaCLVT: 'Dây kéo', KhachHang: 'Uniqlo' },
                { POID: 'PO2405027', MaHang: 'STYLE_339', TenNPL: 'Vải chính Khaki Cotton', NhaCungCap: 'Phong Phu Fabric', SoLuong: 6000, DonViTinh: 'm', NgayDuKien: '2026-07-01T00:00:00', TrangThai: 'arrived', MaCLVT: 'Vải chính', KhachHang: 'Gap' },
                { POID: 'PO2405028', MaHang: 'STYLE_605', TenNPL: 'Zipper YKK #5 Black', NhaCungCap: 'YKK Vietnam', SoLuong: 5000, DonViTinh: 'pcs', NgayDuKien: '2026-06-15T00:00:00', TrangThai: 'arrived', MaCLVT: 'ZIPPER', KhachHang: 'Uniqlo' },
                { POID: 'PO2405029', MaHang: 'STYLE_709', TenNPL: 'Zipper YKK #3 Navy', NhaCungCap: 'YKK Vietnam', SoLuong: 4000, DonViTinh: 'pcs', NgayDuKien: '2026-07-20T00:00:00', TrangThai: 'ordered', MaCLVT: 'ZIPPER', KhachHang: 'H&M' },
                { POID: 'PO2405030', MaHang: 'STYLE_112', TenNPL: 'Zipper Nylon 18cm', NhaCungCap: 'YKK Vietnam', SoLuong: 6000, DonViTinh: 'pcs', NgayDuKien: '2026-07-25T00:00:00', TrangThai: 'incoming', MaCLVT: 'ZIPPER', KhachHang: 'Zara' },
                { POID: 'PO2405031', MaHang: 'STYLE_889', TenNPL: 'Zipper Metal #5', NhaCungCap: 'YKK Vietnam', SoLuong: 2000, DonViTinh: 'pcs', NgayDuKien: '2026-06-02T00:00:00', TrangThai: 'fail', MaCLVT: 'ZIPPER', KhachHang: 'H&M' },
                { POID: 'PO2405032', MaHang: 'STYLE_332', TenNPL: 'Vải Reflex xám sáng 5cm', NhaCungCap: '3M Vietnam', SoLuong: 1200, DonViTinh: 'm', NgayDuKien: '2026-06-18T00:00:00', TrangThai: 'arrived', MaCLVT: 'REFLEX', KhachHang: 'Gap' },
                { POID: 'PO2405033', MaHang: 'STYLE_441', TenNPL: 'Băng phản quang bạc', NhaCungCap: '3M Vietnam', SoLuong: 1500, DonViTinh: 'm', NgayDuKien: '2026-07-22T00:00:00', TrangThai: 'ordered', MaCLVT: 'REFLEX', KhachHang: 'Nike' },
                { POID: 'PO2405034', MaHang: 'STYLE_512', TenNPL: 'Dây viền phản quang', NhaCungCap: '3M Vietnam', SoLuong: 800, DonViTinh: 'm', NgayDuKien: '2026-07-28T00:00:00', TrangThai: 'incoming', MaCLVT: 'REFLEX', KhachHang: 'Adidas' },
                { POID: 'PO2405035', MaHang: 'STYLE_223', TenNPL: 'Decal phản quang nhiệt', NhaCungCap: '3M Vietnam', SoLuong: 500, DonViTinh: 'm', NgayDuKien: '2026-06-05T00:00:00', TrangThai: 'fail', MaCLVT: 'REFLEX', KhachHang: 'Zara' },
                { POID: 'PO2405036', MaHang: 'STYLE_904', TenNPL: 'Slider YKK #5', NhaCungCap: 'YKK Vietnam', SoLuong: 10000, DonViTinh: 'pcs', NgayDuKien: '2026-06-22T00:00:00', TrangThai: 'arrived', MaCLVT: 'SLIDER', KhachHang: 'Uniqlo' },
                { POID: 'PO2405037', MaHang: 'STYLE_339', TenNPL: 'Slider YKK #3', NhaCungCap: 'YKK Vietnam', SoLuong: 8000, DonViTinh: 'pcs', NgayDuKien: '2026-07-15T00:00:00', TrangThai: 'ordered', MaCLVT: 'SLIDER', KhachHang: 'Gap' },
                { POID: 'PO2405038', MaHang: 'STYLE_959', TenNPL: 'Slider kim loại đen', NhaCungCap: 'YKK Vietnam', SoLuong: 5000, DonViTinh: 'pcs', NgayDuKien: '2026-07-26T00:00:00', TrangThai: 'incoming', MaCLVT: 'SLIDER', KhachHang: 'Decathlon' },
                { POID: 'PO2405039', MaHang: 'STYLE_110', TenNPL: 'Slider tự khóa YKK', NhaCungCap: 'YKK Vietnam', SoLuong: 3000, DonViTinh: 'pcs', NgayDuKien: '2026-06-01T00:00:00', TrangThai: 'fail', MaCLVT: 'SLIDER', KhachHang: 'Adidas' },
                { POID: 'PO2405040', MaHang: 'STYLE_875', TenNPL: 'Puller nhựa silicone', NhaCungCap: 'Duy Cuong Metal', SoLuong: 6000, DonViTinh: 'pcs', NgayDuKien: '2026-06-25T00:00:00', TrangThai: 'arrived', MaCLVT: 'PULLER', KhachHang: 'Puma' },
                { POID: 'PO2405041', MaHang: 'STYLE_230', TenNPL: 'Puller dây dệt', NhaCungCap: 'Nha Be Accessories', SoLuong: 5000, DonViTinh: 'pcs', NgayDuKien: '2026-07-18T00:00:00', TrangThai: 'ordered', MaCLVT: 'PULLER', KhachHang: 'Nike' },
                { POID: 'PO2405042', MaHang: 'STYLE_959', TenNPL: 'Puller kim loại khắc logo', NhaCungCap: 'Phong Phu Accessories', SoLuong: 4000, DonViTinh: 'pcs', NgayDuKien: '2026-07-24T00:00:00', TrangThai: 'incoming', MaCLVT: 'PULLER', KhachHang: 'Decathlon' },
                { POID: 'PO2405043', MaHang: 'STYLE_339', TenNPL: 'Puller dây chun co giãn', NhaCungCap: 'Duy Cuong Metal', SoLuong: 2000, DonViTinh: 'pcs', NgayDuKien: '2026-06-03T00:00:00', TrangThai: 'fail', MaCLVT: 'PULLER', KhachHang: 'Gap' },
                { POID: 'PO2405044', MaHang: 'STYLE_512', TenNPL: 'Nút bấm snaps kim loại 15mm', NhaCungCap: 'Duy Cuong Metal', SoLuong: 15000, DonViTinh: 'pcs', NgayDuKien: '2026-06-24T00:00:00', TrangThai: 'arrived', MaCLVT: 'SNAP BUTTON', KhachHang: 'Decathlon' },
                { POID: 'PO2405045', MaHang: 'STYLE_441', TenNPL: 'Nút đồng đục lỗ', NhaCungCap: 'Duy Cuong Metal', SoLuong: 12000, DonViTinh: 'pcs', NgayDuKien: '2026-07-19T00:00:00', TrangThai: 'ordered', MaCLVT: 'SNAP BUTTON', KhachHang: 'Nike' },
                { POID: 'PO2405046', MaHang: 'STYLE_223', TenNPL: 'Nút bấm nhựa màu đen', NhaCungCap: 'Nha Be Accessories', SoLuong: 8000, DonViTinh: 'pcs', NgayDuKien: '2026-07-28T00:00:00', TrangThai: 'incoming', MaCLVT: 'SNAP BUTTON', KhachHang: 'Zara' },
                { POID: 'PO2405047', MaHang: 'STYLE_441', TenNPL: 'Nút gài snaps inox', NhaCungCap: 'Duy Cuong Metal', SoLuong: 5000, DonViTinh: 'pcs', NgayDuKien: '2026-06-04T00:00:00', TrangThai: 'fail', MaCLVT: 'SNAP BUTTON', KhachHang: 'Nike' },
                { POID: 'PO2405048', MaHang: 'STYLE_223', TenNPL: 'Nút nhựa 4 lỗ trong suốt', NhaCungCap: 'Nha Be Accessories', SoLuong: 20000, DonViTinh: 'pcs', NgayDuKien: '2026-06-20T00:00:00', TrangThai: 'arrived', MaCLVT: 'PLASTIC BUTTON', KhachHang: 'Zara' },
                { POID: 'PO2405049', MaHang: 'STYLE_441', TenNPL: 'Nút nhựa bọc vải thời trang', NhaCungCap: 'Nha Be Accessories', SoLuong: 10000, DonViTinh: 'pcs', NgayDuKien: '2026-07-14T00:00:00', TrangThai: 'ordered', MaCLVT: 'PLASTIC BUTTON', KhachHang: 'Nike' },
                { POID: 'PO2405050', MaHang: 'STYLE_512', TenNPL: 'Nút nhựa logo Decathlon 12mm', NhaCungCap: 'Nha Be Accessories', SoLuong: 18000, DonViTinh: 'pcs', NgayDuKien: '2026-07-22T00:00:00', TrangThai: 'incoming', MaCLVT: 'PLASTIC BUTTON', KhachHang: 'Decathlon' },
                { POID: 'PO2405051', MaHang: 'STYLE_223', TenNPL: 'Nút nhựa giả sừng', NhaCungCap: 'Nha Be Accessories', SoLuong: 6000, DonViTinh: 'pcs', NgayDuKien: '2026-06-06T00:00:00', TrangThai: 'fail', MaCLVT: 'PLASTIC BUTTON', KhachHang: 'Zara' },
                { POID: 'PO2405052', MaHang: 'STYLE_889', TenNPL: 'Băng gai velcro 2.5cm đen', NhaCungCap: 'Paiho Vietnam', SoLuong: 4000, DonViTinh: 'm', NgayDuKien: '2026-06-27T00:00:00', TrangThai: 'arrived', MaCLVT: 'VELCRO', KhachHang: 'Decathlon' },
                { POID: 'PO2405053', MaHang: 'STYLE_332', TenNPL: 'Băng dính gai velcro cuộn', NhaCungCap: 'Paiho Vietnam', SoLuong: 3000, DonViTinh: 'm', NgayDuKien: '2026-07-16T00:00:00', TrangThai: 'ordered', MaCLVT: 'VELCRO', KhachHang: 'Gap' },
                { POID: 'PO2405054', MaHang: 'STYLE_889', TenNPL: 'Velcro dán mũ bảo hiểm', NhaCungCap: 'Paiho Vietnam', SoLuong: 2000, DonViTinh: 'm', NgayDuKien: '2026-07-25T00:00:00', TrangThai: 'incoming', MaCLVT: 'VELCRO', KhachHang: 'Decathlon' },
                { POID: 'PO2405055', MaHang: 'STYLE_332', TenNPL: 'Velcro ép nhiệt', NhaCungCap: 'Paiho Vietnam', SoLuong: 1000, DonViTinh: 'm', NgayDuKien: '2026-06-03T00:00:00', TrangThai: 'fail', MaCLVT: 'VELCRO', KhachHang: 'Gap' },
                { POID: 'PO2405056', MaHang: 'STYLE_605', TenNPL: 'Chun dệt kim co giãn 4cm', NhaCungCap: 'Binh Minh Elastic', SoLuong: 8000, DonViTinh: 'm', NgayDuKien: '2026-06-23T00:00:00', TrangThai: 'arrived', MaCLVT: 'Chun quần', KhachHang: 'Uniqlo' },
                { POID: 'PO2405057', MaHang: 'STYLE_709', TenNPL: 'Chun sợi tròn luồn cạp', NhaCungCap: 'Binh Minh Elastic', SoLuong: 6000, DonViTinh: 'm', NgayDuKien: '2026-07-12T00:00:00', TrangThai: 'ordered', MaCLVT: 'Chun quần', KhachHang: 'H&M' },
                { POID: 'PO2405058', MaHang: 'STYLE_112', TenNPL: 'Chun dệt thoi siêu bền', NhaCungCap: 'Binh Minh Elastic', SoLuong: 5000, DonViTinh: 'm', NgayDuKien: '2026-07-20T00:00:00', TrangThai: 'incoming', MaCLVT: 'Chun quần', KhachHang: 'Zara' },
                { POID: 'PO2405059', MaHang: 'STYLE_605', TenNPL: 'Chun cao su chống trượt', NhaCungCap: 'Binh Minh Elastic', SoLuong: 2000, DonViTinh: 'm', NgayDuKien: '2026-06-04T00:00:00', TrangThai: 'fail', MaCLVT: 'Chun quần', KhachHang: 'Uniqlo' },
                { POID: 'PO2405060', MaHang: 'STYLE_110', TenNPL: 'Mex giấy 30g dán cổ áo', NhaCungCap: 'Vilene Vietnam', SoLuong: 1200, DonViTinh: 'm', NgayDuKien: '2026-06-25T00:00:00', TrangThai: 'arrived', MaCLVT: 'Mex dựng', KhachHang: 'Adidas' },
                { POID: 'PO2405061', MaHang: 'STYLE_875', TenNPL: 'Mex vải dệt tricot', NhaCungCap: 'Vilene Vietnam', SoLuong: 1000, DonViTinh: 'm', NgayDuKien: '2026-07-14T00:00:00', TrangThai: 'ordered', MaCLVT: 'Mex dựng', KhachHang: 'Puma' },
                { POID: 'PO2405062', MaHang: 'STYLE_230', TenNPL: 'Mex dựng không dệt', NhaCungCap: 'Vilene Vietnam', SoLuong: 700, DonViTinh: 'm', NgayDuKien: '2026-07-22T00:00:00', TrangThai: 'incoming', MaCLVT: 'Mex dựng', KhachHang: 'Nike' },
                { POID: 'PO2405063', MaHang: 'STYLE_110', TenNPL: 'Mếch giấy hột tan', NhaCungCap: 'Vilene Vietnam', SoLuong: 400, DonViTinh: 'm', NgayDuKien: '2026-06-05T00:00:00', TrangThai: 'fail', MaCLVT: 'Mex dựng', KhachHang: 'Adidas' },
                { POID: 'PO2405064', MaHang: 'STYLE_959', TenNPL: 'Túi PE in logo 30x40cm', NhaCungCap: 'Tan Tien Plastic', SoLuong: 50000, DonViTinh: 'pcs', NgayDuKien: '2026-06-28T00:00:00', TrangThai: 'arrived', MaCLVT: 'Bao bì', KhachHang: 'Decathlon' },
                { POID: 'PO2405065', MaHang: 'STYLE_110', TenNPL: 'Thùng carton đựng hàng xuất khẩu', NhaCungCap: 'Dong A Carton', SoLuong: 5000, DonViTinh: 'pcs', NgayDuKien: '2026-07-18T00:00:00', TrangThai: 'ordered', MaCLVT: 'Bao bì', KhachHang: 'Adidas' },
                { POID: 'PO2405066', MaHang: 'STYLE_339', TenNPL: 'Túi OPP có băng keo dán', NhaCungCap: 'Tan Tien Plastic', SoLuong: 40000, DonViTinh: 'pcs', NgayDuKien: '2026-07-25T00:00:00', TrangThai: 'incoming', MaCLVT: 'Bao bì', KhachHang: 'Gap' },
                { POID: 'PO2405067', MaHang: 'STYLE_959', TenNPL: 'Hộp giấy Kraft xi nâu', NhaCungCap: 'Dong A Carton', SoLuong: 3000, DonViTinh: 'pcs', NgayDuKien: '2026-06-03T00:00:00', TrangThai: 'fail', MaCLVT: 'Bao bì', KhachHang: 'Decathlon' }
            ],


            materialDetails: [
                { PINCC: '9-146', POMua: '9-146', ItemCode: '9-146', MaMauVT: '', Mau: '', WidthSize: '152*63 CM', DonViVT: 'pcs', KhachHang: 'VKDK', MaLenh: 'LSX-001', MaHang: 'STYLE-001', SoLuong: 330, SoBarcode: 7, ChungLoaiVatTu: 'Vải chính' },
                { PINCC: '9-146', POMua: '9-146', ItemCode: '9-146', MaMauVT: '', Mau: '', WidthSize: '66*60 CM', DonViVT: 'pcs', KhachHang: 'VKDK', MaLenh: 'LSX-001', MaHang: 'STYLE-001', SoLuong: 799, SoBarcode: 17, ChungLoaiVatTu: 'Vải chính' },
                { PINCC: '95499834', POMua: '95499834', ItemCode: 'LAAUC10', MaMauVT: 'WHITE', Mau: 'WHITE', WidthSize: '', DonViVT: 'pcs', KhachHang: 'MSA', MaLenh: 'LSX-002', MaHang: 'STYLE-002', SoLuong: 10, SoBarcode: 1, ChungLoaiVatTu: 'Vải lót' },
                { PINCC: '95499834', POMua: '95499834', ItemCode: 'LAAUC16', MaMauVT: 'WHITE', Mau: 'WHITE', WidthSize: '', DonViVT: 'pcs', KhachHang: 'MSA', MaLenh: 'LSX-003', MaHang: 'STYLE-003', SoLuong: 5, SoBarcode: 1, ChungLoaiVatTu: 'Vải lót' },
                { PINCC: '95499834', POMua: '95499834', ItemCode: 'LAAUC17', MaMauVT: 'WHITE', Mau: 'WHITE', WidthSize: '', DonViVT: 'pcs', KhachHang: 'MSA', MaLenh: 'LSX-002', MaHang: 'STYLE-002', SoLuong: 15, SoBarcode: 1, ChungLoaiVatTu: 'Vải lót' },
                { PINCC: '95499834', POMua: '95499834', ItemCode: 'LAAUT10', MaMauVT: 'WHITE', Mau: 'WHITE', WidthSize: '', DonViVT: 'pcs', KhachHang: 'MSA', MaLenh: 'LSX-004', MaHang: 'STYLE-004', SoLuong: 2, SoBarcode: 1, ChungLoaiVatTu: 'Chỉ may' },
                { PINCC: '95499834', POMua: '95499834', ItemCode: 'LAEC195', MaMauVT: 'WHITE', Mau: 'WHITE', WidthSize: '', DonViVT: 'pcs', KhachHang: 'MSA', MaLenh: 'LSX-005', MaHang: 'STYLE-005', SoLuong: 1, SoBarcode: 1, ChungLoaiVatTu: 'Phụ liệu' },
                { PINCC: '95499834', POMua: '95499834', ItemCode: 'LAEC241', MaMauVT: 'WHITE', Mau: 'WHITE', WidthSize: '', DonViVT: 'pcs', KhachHang: 'MSA', MaLenh: 'LSX-005', MaHang: 'STYLE-005', SoLuong: 50, SoBarcode: 1, ChungLoaiVatTu: 'Phụ liệu' },
                { PINCC: '95499834', POMua: '95499834', ItemCode: 'ZBR83NA_18', MaMauVT: 'BKL', Mau: 'BLACK', WidthSize: '18 CM', DonViVT: 'pcs', KhachHang: 'MSA', MaLenh: 'LSX-006', MaHang: 'STYLE-006', SoLuong: 2, SoBarcode: 1, ChungLoaiVatTu: 'Tem nhãn' },
                { PINCC: '95499836', POMua: '95499836', ItemCode: 'F20NA', MaMauVT: 'NAVY', Mau: 'NAVY', WidthSize: '155', DonViVT: 'MTS', KhachHang: 'MSA', MaLenh: 'LSX-007', MaHang: 'STYLE-007', SoLuong: 32.4, SoBarcode: 1, ChungLoaiVatTu: 'Bao bì' }
            ],
            monthlyLineRevenue: {
                '12/2023': [
                    { LineName: 'Chuyền 1', LineRevenue: 2500000, LinePlanRevenue: 2400000 },
                    { LineName: 'Chuyền 2', LineRevenue: 2000000, LinePlanRevenue: 2000000 },
                    { LineName: 'Chuyền 3', LineRevenue: 1800000, LinePlanRevenue: 1800000 },
                    { LineName: 'Chuyền 4', LineRevenue: 1900000, LinePlanRevenue: 1800000 }
                ],
                '01/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 3000000, LinePlanRevenue: 2800000 },
                    { LineName: 'Chuyền 2', LineRevenue: 2200000, LinePlanRevenue: 2100000 },
                    { LineName: 'Chuyền 3', LineRevenue: 2000000, LinePlanRevenue: 2000000 },
                    { LineName: 'Chuyền 4', LineRevenue: 2300000, LinePlanRevenue: 2100000 }
                ],
                '02/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 3200000, LinePlanRevenue: 3100000 },
                    { LineName: 'Chuyền 2', LineRevenue: 2500000, LinePlanRevenue: 2400000 },
                    { LineName: 'Chuyền 3', LineRevenue: 2100000, LinePlanRevenue: 2000000 },
                    { LineName: 'Chuyền 4', LineRevenue: 2500000, LinePlanRevenue: 2500000 }
                ],
                '03/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 3800000, LinePlanRevenue: 3600000 },
                    { LineName: 'Chuyền 2', LineRevenue: 3000000, LinePlanRevenue: 3000000 },
                    { LineName: 'Chuyền 3', LineRevenue: 2500000, LinePlanRevenue: 2600000 },
                    { LineName: 'Chuyền 4', LineRevenue: 2800000, LinePlanRevenue: 2800000 }
                ],
                '04/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 4800000, LinePlanRevenue: 4500000 },
                    { LineName: 'Chuyền 2', LineRevenue: 3800000, LinePlanRevenue: 3700000 },
                    { LineName: 'Chuyền 3', LineRevenue: 3100000, LinePlanRevenue: 3000000 },
                    { LineName: 'Chuyền 4', LineRevenue: 3500000, LinePlanRevenue: 3300000 }
                ],
                '05/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 5800000, LinePlanRevenue: 5400000 },
                    { LineName: 'Chuyền 2', LineRevenue: 4600000, LinePlanRevenue: 4300000 },
                    { LineName: 'Chuyền 3', LineRevenue: 3800000, LinePlanRevenue: 3500000 },
                    { LineName: 'Chuyền 4', LineRevenue: 4300000, LinePlanRevenue: 3800000 }
                ]
            }
        },
        sql: {
            kpis: {
                totalOrders: 142,
                prodOrders: 104,
                deliveredOrders: 98,
                lateOrders: 15,
                revenue: "22.4",
                otd: "94%"
            },
            revenueStats: {
                total: "22.4 tỷ",
                plan: "20.0 tỷ",
                percent: "112.0%"
            },
            revenueChart: {
                months: ['12/2023', '01/2024', '02/2024', '03/2024', '04/2024', '05/2024'],
                revenue: [9.0, 11.2, 12.8, 14.5, 18.0, 22.4],
                plan: [9.0, 10.0, 11.5, 13.0, 16.5, 20.0],
                luyKe: [9.0, 20.2, 33.0, 47.5, 65.5, 87.9],
                luyKePlan: [9.0, 19.0, 30.5, 43.5, 60.0, 80.0]
            },
            gantt: [
                { po: 'PO2405001', customer: 'DH_607|Week_09_2026_106833547', qty: '140,000', orderCode: 'ORD2405001', etd: '20/06/2024', startDate: '2024-05-01', endDate: '2024-06-20', progress: 30, status: 'slow' },
                { po: 'PO2405002', customer: 'Adidas', qty: '110,000', orderCode: 'ORD2405002', etd: '17/06/2024', startDate: '2024-05-08', endDate: '2024-06-17', progress: 42, status: 'slow' },
                { po: 'PO2405003', customer: 'Puma', qty: '90,000', orderCode: 'ORD2405003', etd: '15/06/2024', startDate: '2024-05-05', endDate: '2024-06-15', progress: 68, status: 'average' },
                { po: 'PO2405004', customer: 'Under Armour', qty: '160,000', orderCode: 'ORD2405004', etd: '25/06/2024', startDate: '2024-05-10', endDate: '2024-06-25', progress: 84, status: 'passed' },
                { po: 'PO2405005', customer: 'Decathlon', qty: '80,000', orderCode: 'ORD2405005', etd: '30/06/2024', startDate: '2024-05-20', endDate: '2024-06-30', progress: 99, status: 'complete' },
                { po: 'PO2405006', customer: 'Uniqlo', qty: '115,000', orderCode: 'ORD2405006', etd: '10/07/2024', startDate: '2024-05-15', endDate: '2024-07-10', progress: 88, status: 'passed' },
                { po: 'PO2405007', customer: 'H&M', qty: '125,000', orderCode: 'ORD2405007', etd: '05/07/2024', startDate: '2024-05-25', endDate: '2024-07-05', progress: 52, status: 'average' },
                { po: 'PO2405008', customer: 'Zara', qty: '75,000', orderCode: 'ORD2405008', etd: '22/06/2024', startDate: '2024-05-12', endDate: '2024-06-22', progress: 95, status: 'complete' },
                { po: 'PO2405009', customer: 'Target', qty: '140,000', orderCode: 'ORD2405009', etd: '15/07/2024', startDate: '2024-06-01', endDate: '2024-07-15', progress: 22, status: 'slow' },
                { po: 'PO2405010', customer: 'Gap', qty: '95,000', orderCode: 'ORD2405010', etd: '28/06/2024', startDate: '2024-05-18', endDate: '2024-06-28', progress: 62, status: 'average' },
                { po: 'PO2405011', customer: 'Columbia', qty: '50,000', orderCode: 'ORD2405011', etd: '18/07/2024', startDate: '2024-06-05', endDate: '2024-07-18', progress: 78, status: 'average' },
                { po: 'PO2405012', customer: 'Fila', qty: '60,000', orderCode: 'ORD2405012', etd: '12/06/2024', startDate: '2024-05-02', endDate: '2024-06-12', progress: 100, status: 'complete' },
                { po: 'PO2405013', customer: 'New Balance', qty: '115,000', orderCode: 'ORD2405013', etd: '24/07/2024', startDate: '2024-06-10', endDate: '2024-07-24', progress: 70, status: 'average' },
                { po: 'PO2405014', customer: 'Lululemon', qty: '85,000', orderCode: 'ORD2405014', etd: '08/07/2024', startDate: '2024-05-22', endDate: '2024-07-08', progress: 38, status: 'slow' },
                { po: 'PO2405015', customer: 'Champion', qty: '130,000', orderCode: 'ORD2405015', etd: '16/07/2024', startDate: '2024-05-28', endDate: '2024-07-16', progress: 92, status: 'passed' }
            ],
            kanban: [
                { id: 1, name: 'NPL', orders: '104 đơn hàng', progress: 97 },
                { id: 2, name: 'CẮT', orders: '98 đơn hàng', progress: 92 },
                { id: 3, name: 'MAY', orders: '92 đơn hàng', progress: 88 },
                { id: 4, name: 'HOÀN THIỆN', orders: '78 đơn hàng', progress: 74 },
                { id: 5, name: 'NHẬN TP', orders: '72 đơn hàng', progress: 70 },
                { id: 6, name: 'ĐÓNG GÓI', orders: '65 đơn hàng', progress: 63 },
                { id: 7, name: 'KIỂM HÀNG', orders: '90 đơn hàng', progress: 48 }
            ],
            wip: {
                totalPcs: '34,200 pcs',
                prodOrders: 104,
                avgCompletion: '68%',
                trendCompare: '↑ 7.1%',
                stages: [
                    { name: 'CUT (Đã cắt)', pcs: 120000, percentage: 100 },
                    { name: 'BTP (Chuẩn bị may)', pcs: 105000, percentage: 88 },
                    { name: 'SEW (May)', pcs: 95000, percentage: 79 },
                    { name: 'ENDLINE (Hoàn thiện)', pcs: 80000, percentage: 67 },
                    { name: 'Nhận thành phẩm', pcs: 72000, percentage: 60 },
                    { name: 'PACK (Đóng gói)', pcs: 62000, percentage: 52 },
                    { name: 'AQL (Kiểm hàng)', pcs: 55000, percentage: 46 },
                    { name: 'SHIP (Xuất hàng)', pcs: 30000, percentage: 25 }
                ]
            },
            materials: [
                { type: 'Vải chính', demand: 6000, available: 6000, pct: 100, status: 'active' },
                { type: 'Vải lót', demand: 4000, available: 4000, pct: 100, status: 'active' },
                { type: 'Chỉ may', demand: 250, available: 230, pct: 92, status: 'active' },
                { type: 'Phụ liệu', demand: 1200, available: 900, pct: 75, status: 'warning' },
                { type: 'Tem nhãn', demand: 120000, available: 60000, pct: 50, status: 'warning' },
                { type: 'Bao bì', demand: 12000, available: 2000, pct: 16, status: 'critical' }
            ],
            riskOrders: [
                { po: 'PO2405003', customer: 'Puma', score: 80, reason: 'Thiếu phụ liệu chính', etd: '15/06/2024' },
                { po: 'PO2405004', customer: 'Under Armour', score: 65, reason: 'Pack chậm trễ', etd: '25/06/2024' },
                { po: 'PO2405002', customer: 'Adidas', score: 55, reason: 'NPL tem nhãn chậm', etd: '17/06/2024' },
                { po: 'PO2405005', customer: 'Decathlon', score: 48, reason: 'Sew tiến độ kém', etd: '30/06/2024' },
                { po: 'PO2405001', customer: 'DH_607|Week_09_2026_106833547', score: 38, reason: 'AQL pending', etd: '20/06/2024' }
            ],
            overallCompletion: 71,
            customerRevenue: [
                { name: 'DH_607|Week_09_2026_106833547', value: 8.8, pct: '39%', color: 'var(--color-cust-rank1)' },
                { name: 'Adidas', value: 6.2, pct: '28%', color: 'var(--color-cust-rank2)' },
                { name: 'Puma', value: 3.6, pct: '16%', color: 'var(--color-cust-rank3)' },
                { name: 'Under Armour', value: 2.2, pct: '10%', color: 'var(--color-cust-rank4)' },
                { name: 'Decathlon', value: 1.6, pct: '7%', color: 'var(--color-cust-rank5)' },
                { name: 'Khác', value: 0.3, pct: '1.3%', color: 'var(--color-cust-other)' }
            ],
            purchaseTracking: {
                summary: { ordered: 78, arrived: 52, incoming: 18, fail: 8 },
                items: [
                    { itemCode: 'Vải chính', poOrdered: 25, poArrived: 18, poIncoming: 5, poFail: 2 },
                    { itemCode: 'Vải lót', poOrdered: 17, poArrived: 12, poIncoming: 4, poFail: 1 },
                    { itemCode: 'Chỉ may', poOrdered: 18, poArrived: 10, poIncoming: 5, poFail: 3 },
                    { itemCode: 'Nút áo', poOrdered: 9, poArrived: 6, poIncoming: 2, poFail: 1 },
                    { itemCode: 'Dây kéo', poOrdered: 4, poArrived: 3, poIncoming: 1, poFail: 0 },
                    { itemCode: 'Tem nhãn', poOrdered: 5, poArrived: 3, poIncoming: 1, poFail: 1 }
                ]
            },
            monthlyLineRevenue: {
                '12/2023': [
                    { LineName: 'Chuyền 1', LineRevenue: 2800000, LinePlanRevenue: 2500000 },
                    { LineName: 'Chuyền 2', LineRevenue: 2200000, LinePlanRevenue: 2000000 },
                    { LineName: 'Chuyền 3', LineRevenue: 2000000, LinePlanRevenue: 2000000 },
                    { LineName: 'Chuyền 4', LineRevenue: 2000000, LinePlanRevenue: 2000000 }
                ],
                '01/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 3500000, LinePlanRevenue: 3000000 },
                    { LineName: 'Chuyền 2', LineRevenue: 2700000, LinePlanRevenue: 2500000 },
                    { LineName: 'Chuyền 3', LineRevenue: 2500000, LinePlanRevenue: 2500000 },
                    { LineName: 'Chuyền 4', LineRevenue: 2500000, LinePlanRevenue: 2400000 }
                ],
                '02/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 4000000, LinePlanRevenue: 3800000 },
                    { LineName: 'Chuyền 2', LineRevenue: 3000000, LinePlanRevenue: 3000000 },
                    { LineName: 'Chuyền 3', LineRevenue: 2800000, LinePlanRevenue: 2600000 },
                    { LineName: 'Chuyền 4', LineRevenue: 3000000, LinePlanRevenue: 2800000 }
                ],
                '03/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 4500000, LinePlanRevenue: 4300000 },
                    { LineName: 'Chuyền 2', LineRevenue: 3500000, LinePlanRevenue: 3200000 },
                    { LineName: 'Chuyền 3', LineRevenue: 3200000, LinePlanRevenue: 3000000 },
                    { LineName: 'Chuyền 4', LineRevenue: 3300000, LinePlanRevenue: 3100000 }
                ],
                '04/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 5500000, LinePlanRevenue: 5000000 },
                    { LineName: 'Chuyền 2', LineRevenue: 4500000, LinePlanRevenue: 4000000 },
                    { LineName: 'Chuyền 3', LineRevenue: 4000000, LinePlanRevenue: 3800000 },
                    { LineName: 'Chuyền 4', LineRevenue: 4000000, LinePlanRevenue: 3800000 }
                ],
                '05/2024': [
                    { LineName: 'Chuyền 1', LineRevenue: 7000000, LinePlanRevenue: 6500000 },
                    { LineName: 'Chuyền 2', LineRevenue: 5500000, LinePlanRevenue: 5000000 },
                    { LineName: 'Chuyền 3', LineRevenue: 5000000, LinePlanRevenue: 4800000 },
                    { LineName: 'Chuyền 4', LineRevenue: 4900000, LinePlanRevenue: 4500000 }
                ]
            }
        }
    },
    sqlQueries: [
        `-- Query 1: Fetch dashboard stats counts & OTD\nSELECT \n  (SELECT COUNT(1) FROM Orders) as TotalOrders,\n  (SELECT COUNT(1) FROM Orders WHERE Status = 'Production') as ProdOrders,\n  (SELECT COUNT(1) FROM Orders WHERE Status = 'Delivered') as DeliveredOrders,\n  (SELECT COUNT(1) FROM Orders WHERE IsLate = 1) as LateOrders,\n  (SELECT SUM(ActualRevenue) FROM Financials WHERE DateMonth = '05/2024') as MonthRevenue,\n  (SELECT CAST(COUNT(CASE WHEN DeliveryStatus = 'OnTime' THEN 1 END) AS FLOAT) / COUNT(1) * 100 FROM Shipments) as OtdRate;`,
        `-- Query 2: Fetch Monthly Revenue vs Plan (VND)\nSELECT \n  DateLabel, \n  SUM(ActualRevenue) / 1000000000.0 as RevenueBillions,\n  SUM(PlannedRevenue) / 1000000000.0 as PlanBillions\nFROM RevenueStats\nWHERE DateValue BETWEEN '2023-12-01' AND '2024-05-31'\nGROUP BY DateLabel, DateValue\nORDER BY DateValue;`,
        `-- Query 3: Fetch WIP quantities and completion averages\nSELECT \n  StageName,\n  SUM(WipPcs) as StagePcs,\n  AVG(CompletionPercent) as StagePct\nFROM WipTracking\nGROUP BY StageName, StageOrder\nORDER BY StageOrder;`,
        `-- Query 4: Fetch Material status requirements\nSELECT \n  MaterialName,\n  RequirementQty,\n  AvailableQty,\n  CAST(AvailableQty AS FLOAT) / RequirementQty * 100 as SufficiencyPct\nFROM MaterialsStorage\nORDER BY SufficiencyPct ASC;`
    ]
};
