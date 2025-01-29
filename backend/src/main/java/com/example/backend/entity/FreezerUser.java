package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Objects;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "FreezerUser", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"freezer_id", "user_id"})
})
public class FreezerUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "freezer_id", nullable = false)
    private Freezer freezer;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FreezerUser that)) return false;
        return Objects.equals(getId(), that.getId()) && Objects.equals(getFreezer(), that.getFreezer()) && Objects.equals(getUser(), that.getUser());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getFreezer(), getUser());
    }

    @Override
    public String toString() {
        return "FreezerUser{" +
                "id=" + id +
                ", freezer=" + (freezer != null ? freezer.getId() : null) +
                ", user=" + (user != null ? user.getId() : null) +
                '}';
    }
}



