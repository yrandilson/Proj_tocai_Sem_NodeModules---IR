import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rating } from './Rating';
import { Proposal } from './Proposal';
import { Item } from './Item'; // Assuming Item entity exists for user's owned items
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id;
    @Column({ unique: true })
    email;
    @Column()
    name;
    // Add other user properties as needed, e.g., password, profile picture, etc.
    @OneToMany(() => Rating, rating => rating.fromUser)
    givenRatings;
    @OneToMany(() => Rating, rating => rating.toUser)
    receivedRatings;
    @OneToMany(() => Proposal, proposal => proposal.proposer)
    proposals;
    @OneToMany(() => Item, item => item.owner)
    items; // Items owned by this user
}
//# sourceMappingURL=User.js.map