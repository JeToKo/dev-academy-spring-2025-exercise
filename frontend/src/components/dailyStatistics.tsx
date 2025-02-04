import { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { ElectricData } from '../utils/interfaces';
import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Paper, Collapse, IconButton, TablePagination, styled } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { formatDate, formatNumber} from '../utils/format';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.common.white,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));


const DailyStatistics = () => {
  const [dailyStats, setDailyStats] = useState<any>({});
  const [openRows, setOpenRows] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  
 useEffect(() => {
    getAllData();
  });

  const getAllData = async () => {
    axios.get(`http://localhost:8080/electricity`).then((res) => {
      calculateDailyStats(res.data);
    });
  };

 

  const calculateDailyStats = (allData: ElectricData[]) => {
    const stats: any = {};
    allData.forEach(row => {
      const date = row.date.toString();
      if (!stats[date]) {
        stats[date] = {
          totalConsumption: 0,
          totalProduction: 0,
          priceSum: 0,
          priceCount: 0,
          longestNegative: 0,
          currentlongestNegative: 0,
          data: []
        };
      }
      console.log(stats[date])
      stats[date].totalConsumption += Number(row.consumptionamount);
      stats[date].totalProduction += Number(row.productionamount);
      stats[date].priceSum += Number((row.hourlyprice));
      stats[date].priceCount ++;
      stats[date].data.push(row);
      
      if (row.hourlyprice < 0) {
        stats[date].currentlongestNegative++;
        if (stats[date].currentlongestNegative > stats[date].longestNegative){
          stats[date].longestNegative = stats[date].currentlongestNegative ;
        }
      } else {
        stats[date].currentlongestNegative = 0;
      }
    });
    

    Object.keys(stats).forEach(date => {
      stats[date].averagePrice = stats[date].priceSum / stats[date].priceCount;
    });
    
    setDailyStats(stats);
  };

const toggleRow = (date: string) => {
  setOpenRows(prev => 
    prev.includes(date) 
      ? prev.filter(d => d !== date) 
      : [...prev, date]
  );
};

  return (
    <div className='table'>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell/>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Total Production</StyledTableCell>
                <StyledTableCell>Total Consumption</StyledTableCell>
                <StyledTableCell>Average Price</StyledTableCell>
                <StyledTableCell>Longest Negative Price Streak (hrs)</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {Object.keys(dailyStats).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((date) => (
                <>
                  <StyledTableRow key={date} className='table th'>
                    <StyledTableCell>
                      <IconButton size="small" onClick={() => toggleRow(date)}>
                        {openRows.includes(date) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell>{formatDate(date)}</StyledTableCell>
                    <StyledTableCell>{formatNumber(dailyStats[date].totalProduction)}</StyledTableCell>
                    <StyledTableCell>{formatNumber(dailyStats[date].totalConsumption)}</StyledTableCell>
                    <StyledTableCell>{formatNumber(dailyStats[date].averagePrice)}</StyledTableCell>
                    <StyledTableCell>{dailyStats[date].longestNegative}</StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell colSpan={6}>
                    <Collapse in={openRows.includes(date)} timeout="auto" unmountOnExit>
                        <Table size="small">
                          <TableHead>
                            <StyledTableRow>
                              <StyledTableCell>Start Time</StyledTableCell>
                              <StyledTableCell>Production Amount</StyledTableCell>
                              <StyledTableCell>Consumption Amount</StyledTableCell>
                              <StyledTableCell>Hourly Price</StyledTableCell>
                            </StyledTableRow>
                          </TableHead>
                          <TableBody>
                            {dailyStats[date].data.map((row: ElectricData) => (
                              <StyledTableRow key={row.id}>
                                <StyledTableCell>{formatDate(row.starttime, true)}</StyledTableCell> 
                                <StyledTableCell>{formatNumber(row.productionamount)}</StyledTableCell>
                                <StyledTableCell>{formatNumber(row.consumptionamount)}</StyledTableCell>
                                <StyledTableCell>{formatNumber(row.hourlyprice)}</StyledTableCell>
                              </StyledTableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Collapse>
                    </StyledTableCell>
                  </StyledTableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={Object.keys(dailyStats).length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        >
        </TablePagination>
      </Paper>
    </div>
  );
};

export default DailyStatistics;
