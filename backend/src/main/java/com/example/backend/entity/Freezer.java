package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "freezer")
public class Freezer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "fileName", nullable = false)
    private String fileName;

    @Column(name = "freezerNumber", unique = true, nullable = false, length = 4)
    private String freezerNumber;

    @Column(name = "address", nullable = false, length = 50)
    private String address;

    @Column(name = "room", nullable = false, length = 10)
    private String room;

    @Column(name = "type", nullable = false, length = 10)
    private String type;

    @Column(name = "isDeleted", nullable = false)
    private boolean isDeleted = false;

    @OneToMany(mappedBy = "freezer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FreezerUser> freezerUser = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Freezer freezer)) return false;
        return isDeleted() == freezer.isDeleted() && Objects.equals(getId(), freezer.getId()) && Objects.equals(getFileName(), freezer.getFileName()) && Objects.equals(getFreezerNumber(), freezer.getFreezerNumber()) && Objects.equals(getAddress(), freezer.getAddress()) && Objects.equals(getRoom(), freezer.getRoom()) && Objects.equals(getType(), freezer.getType()) && Objects.equals(getFreezerUser(), freezer.getFreezerUser());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getFileName(), getFreezerNumber(), getAddress(), getRoom(), getType(), isDeleted(), getFreezerUser());
    }
}
