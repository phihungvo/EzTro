package carevn.luv2code.ez_tro.service.impl;

import java.io.ByteArrayInputStream;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.service.ExcelExportService;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    @Override
    public ByteArrayInputStream exportToExcel(String entityType) {
        return null;
    }

    //    private final UserRepository userRepository;
    //    private final EmployeeRepository employeeRepository;
    //
    //    public ExcelExportServiceImpl(
    //            UserRepository userRepository,
    //            EmployeeRepository employeeRepository) {
    //        this.userRepository = userRepository;
    //        this.employeeRepository = employeeRepository;
    //    }
    //
    //    @Override
    //    public ByteArrayInputStream exportToExcel(String entityType) {
    //        Exportable exportable = getExportableEntity(entityType);
    //        ExcelGenerator generator = new ExcelGenerator(exportable.getExcelColumns(), exportable.getData(),
    // entityType);
    //        return generator.generate();
    //    }
    //
    //    private Exportable getExportableEntity(String entityType) {
    //        switch (entityType.toLowerCase()) {
    //            case "user":
    //                return getUserExportable();
    //            case "employee":
    //                return getEmployeeExportable();
    //            default:
    //                throw new ExcelExportException("Unsupported entity type: " + entityType);
    //        }
    //    }
    //
    //    private Exportable getUserExportable() {
    //        return new Exportable() {
    //            @Override
    //            public List<ExcelColumn> getExcelColumns() {
    //                return List.of(
    //                        new ExcelColumn("STT", "stt", Integer.class),
    //                        new ExcelColumn("ID", "id", Integer.class),
    //                        new ExcelColumn("UserName", "userName", String.class),
    //                        new ExcelColumn("Email", "email", String.class),
    //                        new ExcelColumn("Address", "address", String.class),
    //                        new ExcelColumn("Phone Number", "phoneNumber", String.class),
    //                        new ExcelColumn("Enabled", "enabled", Boolean.class));
    //            }
    //
    //            @Override
    //            public List<?> getData() {
    //                return userRepository.findAll();
    //            }
    //        };
    //    }
    //
    //    private Exportable getEmployeeExportable() {
    //        return new Exportable() {
    //            @Override
    //            public List<ExcelColumn> getExcelColumns() {
    //                return List.of(
    //                        new ExcelColumn("STT", "stt", Integer.class),
    //                        new ExcelColumn("ID", "id", Integer.class),
    //                        new ExcelColumn("Employee Code", "employeeCode", String.class),
    //                        new ExcelColumn("First Name", "firstName", String.class),
    //                        new ExcelColumn("Last Name", "lastName", String.class),
    //                        new ExcelColumn("Date of Birth", "dateOfBirth", Date.class),
    //                        new ExcelColumn("Gender", "gender", String.class),
    //                        new ExcelColumn("Email", "email", String.class),
    //                        new ExcelColumn("Phone", "phone", String.class),
    //                        new ExcelColumn("Address", "address", String.class),
    //                        new ExcelColumn("Hire Date", "hireDate", Date.class),
    //                        new ExcelColumn("Is Active", "isActive", Boolean.class));
    //            }
    //
    //            @Override
    //            public List<?> getData() {
    //                return employeeRepository.findAll();
    //            }
    //        };
    //    }

}
