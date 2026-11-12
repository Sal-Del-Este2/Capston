package com.scout.MS_Finanzas.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.scout.MS_Finanzas.model.TransaccionWebpay;
import jakarta.persistence.LockModeType;

public interface TransaccionWebpayRepository extends JpaRepository<TransaccionWebpay, Long> {
    Optional<TransaccionWebpay> findByTokenWs(String tokenWs);
    Optional<TransaccionWebpay> findByBuyOrder(String buyOrder);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT t
        FROM TransaccionWebpay t
        WHERE t.tokenWs = :tokenWs
    """)
    Optional<TransaccionWebpay> findByTokenWsConBloqueo(@Param("tokenWs") String tokenWs);
}