package com.zerox.csm.controllers;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report")
@PreAuthorize("hasRole('ADMIN')")

public class ReportController {
}
