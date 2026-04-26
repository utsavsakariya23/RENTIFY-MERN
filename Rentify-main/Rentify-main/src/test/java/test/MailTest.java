package test;
import java.util.Properties;
import jakarta.mail.*;
import jakarta.mail.internet.*;

public class MailTest {
    public static void main(String[] args) {
        try {
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "587");
            
            Session session = Session.getInstance(props, new Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication("utsavsakariya05@gmail.com", "lsvq cmhx grwf pamr");
                }
            });
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("utsavsakariya05@gmail.com", "Carent Car Rental"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("utsavsakariya05@gmail.com"));
            message.setSubject("Test OTP");
            message.setContent("This is a test OTP.", "text/html; charset=utf-8");
            
            System.out.println("Sending test email...");
            Transport.send(message);
            System.out.println("SUCCESSFULLY SENT");
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }
}
