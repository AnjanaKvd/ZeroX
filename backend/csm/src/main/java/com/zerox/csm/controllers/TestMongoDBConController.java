package com.zerox.csm.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


//not connected mongodb yet
@RestController
@RequestMapping("/testMongoDBCon")
public class TestMongoDBConController {


    @RequestMapping("/testMongoDBCon")
    public String testMongoDBCon() {
        return "Database Connected";

    }


}
