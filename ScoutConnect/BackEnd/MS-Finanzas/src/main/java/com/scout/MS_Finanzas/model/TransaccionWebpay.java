package com.scout.MS_Finanzas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "transacciones_webpay")
@Getter
@Setter
@NoArgsConstructor
public class TransaccionWebpay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pago_id", nullable = false)
    private Pago pago;
    @Column(name = "token_ws", nullable = false, unique = true)
    private String tokenWs;
    @Column(name = "url_webpay", nullable = false)
    private String urlWebpay;
    @Column(name = "buy_order", nullable = false, unique = true)
    private String buyOrder;
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal monto;
    @Column(name = "estado_webpay")
    private String estadoWebpay;
    @Column
    private String vci;
    @Column(name = "response_code")
    private Integer responseCode;
    @Column(name = "authorization_code")
    private String authorizationCode;
    @Column(name = "payment_type_code")
    private String paymentTypeCode;
    @Column(name = "installments_number")
    private Integer installmentsNumber;
    @Column(name = "installments_amount", precision = 12, scale = 0)
    private BigDecimal installmentsAmount;
    @Column(name = "card_number")
    private String cardNumber;
    @Column(name = "accounting_date")
    private String accountingDate;
    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "respuesta_completa", columnDefinition = "jsonb")
    private String respuestaCompleta;
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
}