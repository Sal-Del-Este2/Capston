package com.scout.MS_Finanzas.dto;

// import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CrearOrdenRequest {
    @NotNull(message = "Debe indicar los productos.")
    private List<ItemOrdenRequest> items;
}