package com.zerox.csm.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController


//Check by
//localhost:9500/api/csm/testMysqlCon
public class TestMysqlConController {
    @GetMapping("/testMysqlCon")
    public ResponseEntity<String> testMysqlCon() {
        return ResponseEntity.ok("Database Connected");
    }

}
