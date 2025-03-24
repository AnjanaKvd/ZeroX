package com.zerox.csm.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController


//Check by
//localhost:8080/api/csm/testMysqlCon
public class TestMysqlConController {
    @GetMapping("/testMysqlCon")
    public ResponseEntity<String> testMysqlCon() {
        System.out.println("Connected to mysql");

        return ResponseEntity.ok("Database Connected");

    }

}
