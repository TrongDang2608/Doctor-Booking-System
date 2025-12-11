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

    /**
     * Gửi email đơn thuốc điện tử (HTML) kèm danh sách thuốc.
     */
    public void sendPrescriptionEmailHtml(
            String toEmail,
            String patientName,
            String patientPhone,
            String patientAddress,
            String doctorName,
            String clinicName,
            String clinicAddress,
            String clinicPhone,
            String diagnosisCode,
            String diagnosis,
            String advice,
            String followUpDate,
            String prescriptionId,
            java.util.List<com.doctorbooking.backend.model.PrescriptionMedication> medications
    ) {
        if (!isSmtpConfigured()) {
            logger.warn("⚠️ Skipping email send - SMTP not configured");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Đơn thuốc điện tử của bạn");

            String medsHtml;
            if (medications == null || medications.isEmpty()) {
                medsHtml = "<p style='margin:4px 0;'>Chưa có thuốc.</p>";
            } else {
                StringBuilder sb = new StringBuilder();
                for (var pm : medications) {
                    String qty = pm.getQuantity() != null ? pm.getQuantity().toString() : "";
                    String unit = pm.getUnit() != null ? pm.getUnit() : "";
                    sb.append("""
                      <tr>
                        <td style="padding:8px; border-bottom:1px solid #e2e8f0;">
                          <div style="font-weight:700; color:#0f172a;">%s</div>
                          <div style="color:#475569; font-size:13px;">Liều dùng: %s</div>
                          <div style="color:#475569; font-size:13px;">Tần suất: %s</div>
                          %s
                          <div style="color:#475569; font-size:13px;">Số lượng: %s %s</div>
                          %s
                        </td>
                      </tr>
                    """.formatted(
                            safe(pm.getMedicationName()),
                            safe(pm.getDosage()),
                            safe(pm.getFrequency()),
                            pm.getDuration() != null && !pm.getDuration().isEmpty()
                                    ? "<div style='color:#475569; font-size:13px;'>Thời gian: " + safe(pm.getDuration()) + "</div>"
                                    : "",
                            safe(qty),
                            safe(unit),
                            pm.getInstructions() != null && !pm.getInstructions().isEmpty()
                                    ? "<div style='color:#475569; font-size:13px;'>Hướng dẫn: " + safe(pm.getInstructions()) + "</div>"
                                    : ""
                    ));
                }
                medsHtml = sb.toString();
            }

            String htmlContent = """
              <!DOCTYPE html>
              <html lang="vi">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Đơn thuốc điện tử</title>
              </head>
              <body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:16px; margin:0; color:#0f172a;">
                <div style="max-width:720px; margin:0 auto; background:white; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.08); padding:24px;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                    <div>
                      <div style="font-size:18px; font-weight:800; text-transform:uppercase;">%s</div>
                      <div style="color:#475569; font-size:14px; margin-top:4px;">%s</div>
                      <div style="color:#475569; font-size:14px; margin-top:2px;">SĐT: %s</div>
                    </div>
                    <div style="text-align:right; color:#475569;">
                      <div style="font-size:12px; letter-spacing:1px;">MÃ ĐƠN THUỐC</div>
                      <div style="font-size:14px; font-weight:700;">%s</div>
                    </div>
                  </div>

                  <h3 style="margin:12px 0; font-size:20px; font-weight:800; text-align:center; color:#0f172a;">ĐƠN THUỐC ĐIỆN TỬ</h3>

                  <table style="width:100%%; border-collapse:collapse; margin-bottom:12px;">
                    <tr>
                      <td style="padding:6px 0; width:120px; font-weight:700;">Họ tên:</td>
                      <td style="padding:6px 0;">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0; font-weight:700;">Điện thoại:</td>
                      <td style="padding:6px 0;">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0; font-weight:700;">Địa chỉ:</td>
                      <td style="padding:6px 0;">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0; font-weight:700;">Chẩn đoán:</td>
                      <td style="padding:6px 0;">%s%s</td>
                    </tr>
                  </table>

                  <div style="margin:16px 0; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                    <div style="font-weight:800; margin-bottom:8px;">ĐIỀU TRỊ</div>
                    <table style="width:100%%; border-collapse:collapse;">%s</table>
                  </div>

                  <div style="margin:12px 0; padding:12px; background:#fff7ed; border:1px solid #fdba74; border-radius:8px;">
                    <div><strong>Lời dặn:</strong> %s</div>
                    <div><strong>Ngày tái khám:</strong> %s</div>
                    <div><strong>Bác sĩ:</strong> %s</div>
                  </div>

                  <div style="margin-top:16px; font-size:12px; color:#64748b;">
                    * Email tự động, vui lòng không trả lời. Nếu cần hỗ trợ, liên hệ phòng khám.
                  </div>
                </div>
              </body>
              </html>
            """.formatted(
                    safe(clinicName),
                    safe(clinicAddress),
                    safe(clinicPhone),
                    safe(prescriptionId),
                    safe(patientName),
                    safe(patientPhone),
                    safe(patientAddress),
                    diagnosisCode != null ? safe(diagnosisCode) + " - " : "",
                    diagnosis != null ? safe(diagnosis) : "",
                    medsHtml,
                    advice != null ? safe(advice) : "Không có",
                    followUpDate != null ? safe(followUpDate) : "Không đặt",
                    safe(doctorName)
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Prescription email sent successfully to: {}", toEmail);
        } catch (org.springframework.mail.MailAuthenticationException e) {
            logger.error("❌ SMTP Authentication failed for email: {}. Error: {}", toEmail, e.getMessage());
        } catch (jakarta.mail.MessagingException e) {
            logger.error("❌ Messaging error sending prescription email to: {}. Error: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending prescription email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    private String safe(String v) {
        return v == null ? "" : v;
    }
}

