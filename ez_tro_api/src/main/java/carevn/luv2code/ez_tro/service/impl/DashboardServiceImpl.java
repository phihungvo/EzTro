package carevn.luv2code.ez_tro.service.impl;

import java.util.Date;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.response.ChartData;
import carevn.luv2code.ez_tro.service.DashboardService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    //    private final DepartmentRepository departmentRepository;

    @Override
    public ChartData getEmployeesByDepartment(Boolean status, Date dateFrom, Date dateTo) {
        //        List<Object[]> results = departmentRepository.findEmployeesCountByDepartment(status, dateFrom,
        // dateTo);
        //
        //        List<String> categories = new ArrayList<>();
        //        List<Long> data = new ArrayList<>();
        //
        //        for (Object[] row : results) {
        //            categories.add((String) row[0]);
        //            data.add((Long) row[1]);
        //        }
        //
        //        ChartData chartData = ChartData.builder()
        //                .categories(categories)
        //                .series(List.of(
        //                        Series.builder().name("Số lượng nhân viên").data(data).build()))
        //                .build();

        //        return chartData;
        return null;
    }
}
