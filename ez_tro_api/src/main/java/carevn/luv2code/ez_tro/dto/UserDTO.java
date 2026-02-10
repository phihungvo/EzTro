package carevn.luv2code.ez_tro.dto;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO {
    Integer id;

    String userName;

    String firstName;

    String lastName;

    String email;

    String address;

    String phoneNumber;

    String originalPassword;

    String profilePicture;

    Boolean enabled;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    Set<Integer> roleIds;

    Set<String> roleNames;
}
