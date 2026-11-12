package com.scout.MS_Finanzas.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;

public class MutableClock extends Clock {
    private Instant instante;
    private final ZoneId zona;
    public MutableClock(Instant instante, ZoneId zona) {this.instante = Objects.requireNonNull(instante); this.zona = Objects.requireNonNull(zona);}
    @Override
    public ZoneId getZone() {return zona;}
    @Override
    public Clock withZone(ZoneId zona) {return new MutableClock(instante, zona);}
    @Override
    public Instant instant() {return instante;}
    public void avanzar(Duration duracion) {instante = instante.plus(duracion);}
}