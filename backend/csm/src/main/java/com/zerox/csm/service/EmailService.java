package com.zerox.csm.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    public void sendOrderConfirmationEmail(String toEmail,
                                           String orderId,
                                           String orderDetails) {

        Email from = new Email("no-reply@zerox.com");
        Email to   = new Email(toEmail);
        String subject = "Your Order Confirmation - Order #" + orderId;

        // Build the HTML body
        String html = """
        <html>
            <body>
                <h2>Order Confirmation</h2>
                <p>Thank you for your order! Your order has been successfully placed.</p>
                <p>Order ID: %s</p>
                <h3>Order Details:</h3>
                <p>%s</p>
                <p>Thank you for shopping with us!</p>
                <p>Taprodev Computers<p>
            </body>
        </html>
        """.formatted(orderId, orderDetails);

        Content content = new Content("text/html", html);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to send email", ex);
        }
    }

}
