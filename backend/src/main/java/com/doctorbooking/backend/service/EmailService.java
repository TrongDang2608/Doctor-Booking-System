package com.doctorbooking.backend.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.email.from:Doctor Booking System <noreply@doctorbooking.com>}")
    private String fromEmail;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    /**
     * Kiểm tra cấu hình SMTP trước khi gửi email
     */
    private boolean isSmtpConfigured() {
        if (smtpUsername == null || smtpUsername.trim().isEmpty()) {
            logger.warn("⚠️ SMTP_USERNAME is not configured. Email sending will be skipped.");
            return false;
        }
        return true;
    }

    /**
     * Generic method to send plain text email
     */
    public void sendEmail(String toEmail, String subject, String content) {
        // Kiểm tra cấu hình SMTP trước khi gửi
        if (!isSmtpConfigured()) {
            logger.warn("⚠️ Skipping email send - SMTP not configured");
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, false); // Plain text

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", toEmail);
        } catch (org.springframework.mail.MailAuthenticationException e) {
            logger.error("❌ SMTP Authentication failed for email: {}. Error: {}", toEmail, e.getMessage());
        } catch (jakarta.mail.MessagingException e) {
            logger.error("❌ Messaging error sending email to: {}. Error: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Gửi email thông báo đặt lịch thành công
     * Tất cả dữ liệu đều lấy từ database, không hardcode
     */

    /**
     * Gửi email thông báo đặt lịch thành công
     * Tất cả dữ liệu đều lấy từ database, không hardcode
     */
    public void sendAppointmentConfirmationEmail(
            String toEmail,
            String patientName,
            String patientPhone,
            String doctorName,
            String doctorSpecialization,
            String doctorPhone,
            String doctorAddress,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            String appointmentId,
            String paymentMethod,
            String paymentStatus,
            String price,
            String notes,
            String familyMemberName,
            String familyMemberRelationship) {
        
        // Kiểm tra cấu hình SMTP trước khi gửi
        if (!isSmtpConfigured()) {
            logger.warn("⚠️ Skipping email send - SMTP not configured. Please set SMTP_USERNAME and SMTP_PASSWORD in .env file");
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đặt lịch khám thành công - Doctor Booking System");

            String htmlContent = buildAppointmentConfirmationEmailHtml(
                    patientName,
                    patientPhone,
                    doctorName,
                    doctorSpecialization,
                    doctorPhone,
                    doctorAddress,
                    appointmentDate,
                    appointmentTime,
                    appointmentId,
                    paymentMethod,
                    paymentStatus,
                    price,
                    notes,
                    familyMemberName,
                    familyMemberRelationship
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);

            logger.info("Appointment confirmation email sent successfully to: {}", toEmail);
        } catch (org.springframework.mail.MailAuthenticationException e) {
            logger.error("❌ SMTP Authentication failed for email: {}. " +
                    "Please check your SMTP_USERNAME and SMTP_PASSWORD in .env file. " +
                    "For Gmail, you need to use App Password (not regular password). " +
                    "Error: {}", toEmail, e.getMessage());
            // Không throw exception để không làm gián đoạn quá trình đặt lịch
        } catch (jakarta.mail.MessagingException e) {
            logger.error("❌ Messaging error sending appointment confirmation email to: {}. Error: {}", toEmail, e.getMessage());
            // Không throw exception để không làm gián đoạn quá trình đặt lịch
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending appointment confirmation email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Tạo HTML content cho email xác nhận đặt lịch
     * Tất cả dữ liệu đều từ database
     */
    private String buildAppointmentConfirmationEmailHtml(
            String patientName,
            String patientPhone,
            String doctorName,
            String doctorSpecialization,
            String doctorPhone,
            String doctorAddress,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            String appointmentId,
            String paymentMethod,
            String paymentStatus,
            String price,
            String notes,
            String familyMemberName,
            String familyMemberRelationship) {

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String formattedDate = appointmentDate.format(dateFormatter);
        String formattedTime = appointmentTime.format(timeFormatter);

        String paymentMethodText = switch (paymentMethod != null ? paymentMethod.toUpperCase() : "CASH") {
            case "WALLET" -> "Ví điện tử";
            case "VNPAY" -> "VNPay";
            case "CASH" -> "Tiền mặt";
            default -> "Tiền mặt";
        };

        String paymentStatusText = switch (paymentStatus != null ? paymentStatus.toUpperCase() : "PENDING") {
            case "PAID" -> "Đã thanh toán";
            case "PENDING" -> "Chưa thanh toán";
            case "UNPAID" -> "Chưa thanh toán";
            case "REFUNDED" -> "Đã hoàn tiền";
            default -> "Chưa thanh toán";
        };

        // Xác định tên người khám (nếu đặt cho người nhà thì hiển thị tên người nhà)
        String patientForName = (familyMemberName != null && !familyMemberName.trim().isEmpty()) 
            ? familyMemberName 
            : patientName;
        
        String relationshipText = (familyMemberRelationship != null && !familyMemberRelationship.trim().isEmpty())
            ? getRelationshipLabel(familyMemberRelationship)
            : "Bản thân";

        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận đặt lịch khám</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px 0; text-align: center; background-color: #667eea;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Doctor Booking System</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 20px; background-color: #ffffff;">
                            <div style="max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #333333; margin-top: 0;">Xác nhận đặt lịch khám thành công</h2>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Xin chào <strong>%s</strong>,
                                </p>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Lịch khám đã được đặt thành công!
                                </p>
                                
                                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                    <h3 style="color: #667eea; margin-top: 0;">Thông tin lịch khám</h3>
                                    <table style="width: 100%%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666; width: 150px;"><strong>Mã lịch hẹn:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">#%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Người khám:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s (%s)</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Bác sĩ:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Chuyên khoa:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        %s
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Ngày khám:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Giờ khám:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Phương thức thanh toán:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Trạng thái thanh toán:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Phí khám:</strong></td>
                                            <td style="padding: 8px 0; color: #333333; font-size: 18px; font-weight: bold; color: #667eea;">%s VNĐ</td>
                                        </tr>
                                    </table>
                                </div>
                                
                                %s
                                
                                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                    <p style="color: #856404; margin: 0; font-size: 14px;">
                                        <strong>📌 Lưu ý:</strong> Vui lòng có mặt tại phòng khám trước 15 phút so với giờ hẹn. 
                                        Nếu có thay đổi, vui lòng liên hệ với chúng tôi sớm nhất có thể.
                                    </p>
                                </div>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Chúng tôi rất mong được phục vụ bạn!
                                </p>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Trân trọng,<br>
                                    <strong>Đội ngũ Doctor Booking System</strong>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #f8f9fa; color: #666666; font-size: 12px;">
                            <p style="margin: 0;">
                                Email này được gửi tự động từ hệ thống Doctor Booking System.<br>
                                Vui lòng không trả lời email này.
                            </p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(
                    patientName,
                    appointmentId,
                    patientForName,
                    relationshipText,
                    doctorName,
                    doctorSpecialization,
                    (doctorPhone != null && !doctorPhone.trim().isEmpty() 
                        ? String.format("<tr><td style=\"padding: 8px 0; color: #666666;\"><strong>Điện thoại bác sĩ:</strong></td><td style=\"padding: 8px 0; color: #333333;\">%s</td></tr>", doctorPhone)
                        : "") +
                     (doctorAddress != null && !doctorAddress.trim().isEmpty()
                        ? String.format("<tr><td style=\"padding: 8px 0; color: #666666;\"><strong>Địa chỉ:</strong></td><td style=\"padding: 8px 0; color: #333333;\">%s</td></tr>", doctorAddress)
                        : ""),
                    formattedDate,
                    formattedTime,
                    paymentMethodText,
                    paymentStatusText,
                    price,
                    notes != null && !notes.trim().isEmpty() 
                        ? String.format("""
                            <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="color: #0d47a1; margin: 0;"><strong>Ghi chú:</strong></p>
                                <p style="color: #1565c0; margin: 5px 0 0 0;">%s</p>
                            </div>
                            """, notes)
                        : ""
            );
    }

    /**
     * Gửi email nhắc hẹn lịch khám
     * @param hoursBefore Số giờ trước lịch hẹn (24 hoặc 1)
     */
    public void sendAppointmentReminderEmail(
            String toEmail,
            String patientName,
            String doctorName,
            String doctorSpecialization,
            String doctorPhone,
            String doctorAddress,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            String appointmentId,
            int hoursBefore,
            String familyMemberName,
            String familyMemberRelationship) {
        
        // Kiểm tra cấu hình SMTP trước khi gửi
        if (!isSmtpConfigured()) {
            logger.warn("⚠️ Skipping reminder email - SMTP not configured");
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(String.format("Nhắc hẹn: Lịch khám của bạn còn %d giờ nữa - Doctor Booking System", hoursBefore));

            String htmlContent = buildAppointmentReminderEmailHtml(
                    patientName,
                    doctorName,
                    doctorSpecialization,
                    doctorPhone,
                    doctorAddress,
                    appointmentDate,
                    appointmentTime,
                    appointmentId,
                    hoursBefore,
                    familyMemberName,
                    familyMemberRelationship
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);

            logger.info("✅ Appointment reminder email ({}h before) sent successfully to: {}", hoursBefore, toEmail);
        } catch (org.springframework.mail.MailAuthenticationException e) {
            logger.error("❌ SMTP Authentication failed for reminder email to: {}. Error: {}", toEmail, e.getMessage());
        } catch (jakarta.mail.MessagingException e) {
            logger.error("❌ Messaging error sending reminder email to: {}. Error: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending reminder email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Tạo HTML content cho email nhắc hẹn
     */
    private String buildAppointmentReminderEmailHtml(
            String patientName,
            String doctorName,
            String doctorSpecialization,
            String doctorPhone,
            String doctorAddress,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            String appointmentId,
            int hoursBefore,
            String familyMemberName,
            String familyMemberRelationship) {

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String formattedDate = appointmentDate.format(dateFormatter);
        String formattedTime = appointmentTime.format(timeFormatter);

        // Xác định tên người khám
        String patientForName = (familyMemberName != null && !familyMemberName.trim().isEmpty()) 
            ? familyMemberName 
            : patientName;
        
        String relationshipText = (familyMemberRelationship != null && !familyMemberRelationship.trim().isEmpty())
            ? getRelationshipLabel(familyMemberRelationship)
            : "Bản thân";

        String timeRemainingText = hoursBefore == 24 ? "24 giờ" : "1 giờ";

        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Nhắc hẹn lịch khám</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px 0; text-align: center; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⏰ Nhắc hẹn lịch khám</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 20px; background-color: #ffffff;">
                            <div style="max-width: 600px; margin: 0 auto;">
                                <div style="background: linear-gradient(135deg, #fff3cd 0%%, #ffeaa7 100%%); border-left: 4px solid #f39c12; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                                    <h2 style="color: #d68910; margin-top: 0; font-size: 20px;">
                                        ⏰ Lịch khám của bạn còn <strong>%s</strong> nữa!
                                    </h2>
                                </div>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Xin chào <strong>%s</strong>,
                                </p>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Đây là email nhắc hẹn tự động từ hệ thống. Lịch khám của bạn sẽ diễn ra sau <strong>%s</strong>.
                                </p>
                                
                                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                    <h3 style="color: #667eea; margin-top: 0;">Thông tin lịch khám</h3>
                                    <table style="width: 100%%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666; width: 150px;"><strong>Mã lịch hẹn:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">#%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Người khám:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s (%s)</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Bác sĩ:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Chuyên khoa:</strong></td>
                                            <td style="padding: 8px 0; color: #333333;">%s</td>
                                        </tr>
                                        %s
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Ngày khám:</strong></td>
                                            <td style="padding: 8px 0; color: #333333; font-weight: bold;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #666666;"><strong>Giờ khám:</strong></td>
                                            <td style="padding: 8px 0; color: #333333; font-weight: bold; font-size: 18px; color: #667eea;">%s</td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                                    <p style="color: #856404; margin: 0; font-size: 14px;">
                                        <strong>📌 Lưu ý quan trọng:</strong>
                                    </p>
                                    <ul style="color: #856404; margin: 10px 0 0 0; padding-left: 20px;">
                                        <li>Vui lòng có mặt tại phòng khám <strong>trước 15 phút</strong> so với giờ hẹn</li>
                                        <li>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
                                        <li>Nếu có thay đổi hoặc hủy lịch, vui lòng liên hệ với chúng tôi sớm nhất có thể</li>
                                    </ul>
                                </div>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Chúng tôi rất mong được phục vụ bạn!
                                </p>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Trân trọng,<br>
                                    <strong>Đội ngũ Doctor Booking System</strong>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #f8f9fa; color: #666666; font-size: 12px;">
                            <p style="margin: 0;">
                                Email này được gửi tự động từ hệ thống Doctor Booking System.<br>
                                Vui lòng không trả lời email này.
                            </p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(
                    timeRemainingText,
                    patientName,
                    timeRemainingText,
                    appointmentId,
                    patientForName,
                    relationshipText,
                    doctorName,
                    doctorSpecialization,
                    (doctorPhone != null && !doctorPhone.trim().isEmpty() 
                        ? String.format("<tr><td style=\"padding: 8px 0; color: #666666;\"><strong>Điện thoại bác sĩ:</strong></td><td style=\"padding: 8px 0; color: #333333;\">%s</td></tr>", doctorPhone)
                        : "") +
                     (doctorAddress != null && !doctorAddress.trim().isEmpty()
                        ? String.format("<tr><td style=\"padding: 8px 0; color: #666666;\"><strong>Địa chỉ:</strong></td><td style=\"padding: 8px 0; color: #333333;\">%s</td></tr>", doctorAddress)
                        : ""),
                    formattedDate,
                    formattedTime
            );
    }

    /**
     * Chuyển đổi relationship enum sang tiếng Việt
     */
    private String getRelationshipLabel(String relationship) {
        return switch (relationship != null ? relationship.toUpperCase() : "") {
            case "SELF" -> "Bản thân";
            case "CHILD" -> "Con cái";
            case "PARENT" -> "Bố/Mẹ";
            case "SPOUSE" -> "Vợ/Chồng";
            case "SIBLING" -> "Anh/Chị/Em";
            case "OTHER" -> "Khác";
            default -> relationship;
        };
    }
}

