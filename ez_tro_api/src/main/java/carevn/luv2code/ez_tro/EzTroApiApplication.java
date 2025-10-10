package carevn.luv2code.ez_tro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EzTroApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EzTroApiApplication.class, args);
    }
}
