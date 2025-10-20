package carevn.luv2code.ez_tro.service.impl;

import java.io.ByteArrayInputStream;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.Exportable;
import carevn.luv2code.ez_tro.exception.ExcelExportException;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.ExcelExportService;
import carevn.luv2code.ez_tro.util.ExcelColumn;
import carevn.luv2code.ez_tro.util.ExcelGenerator;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    private final UserRepository userRepository;
    private final BoardingHouseRepository boardingHouseRepository;

    public ExcelExportServiceImpl(UserRepository userRepository, BoardingHouseRepository boardingHouseRepository) {
        this.userRepository = userRepository;
        this.boardingHouseRepository = boardingHouseRepository;
    }

    @Override
    public ByteArrayInputStream exportToExcel(String entityType) {
        Exportable exportable = getExportableEntity(entityType);
        ExcelGenerator generator = new ExcelGenerator(exportable.getExcelColumns(), exportable.getData(), entityType);
        return generator.generate();
    }

    private Exportable getExportableEntity(String entityType) {
        return switch (entityType.toLowerCase()) {
            case "user" -> getUserExportable();
            case "boarding_house" -> getBoardingHouseExportable();
            default -> throw new ExcelExportException("Unsupported entity type: " + entityType);
        };
    }

    private Exportable getUserExportable() {
        return new Exportable() {
            @Override
            public List<ExcelColumn> getExcelColumns() {
                return List.of(
                        new ExcelColumn("STT", "stt", Integer.class),
                        new ExcelColumn("ID", "id", Integer.class),
                        new ExcelColumn("UserName", "userName", String.class),
                        new ExcelColumn("Email", "email", String.class),
                        new ExcelColumn("Address", "address", String.class),
                        new ExcelColumn("Phone Number", "phoneNumber", String.class),
                        new ExcelColumn("Enabled", "enabled", Boolean.class));
            }

            @Override
            public List<?> getData() {
                return userRepository.findAll();
            }
        };
    }

    private Exportable getBoardingHouseExportable() {
        return new Exportable() {
            @Override
            public List<ExcelColumn> getExcelColumns() {
                return List.of(
                        new ExcelColumn("STT", "stt", Integer.class),
                        new ExcelColumn("ID", "id", Integer.class),
                        new ExcelColumn("Boarding House Name", "name", String.class),
                        new ExcelColumn("Address", "address", String.class),
                        new ExcelColumn("Contact Info", "contactPhone", String.class),
                        new ExcelColumn("Owner", "owner", String.class),
                        new ExcelColumn("Description", "description", String.class),
                        new ExcelColumn("Total Room", "totalRooms", Integer.class),
                        new ExcelColumn("Total Building", "totalBuildings", Integer.class),
                        new ExcelColumn("Created At", "createdAt", Date.class),
                        new ExcelColumn("Updated At", "updatedAt", Date.class));
            }

            @Override
            public List<?> getData() {
                return boardingHouseRepository.findAll();
            }
        };
    }
}
