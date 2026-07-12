import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Proposal } from './Proposal';
@Entity()
export class Item {
    @PrimaryGeneratedColumn()
    id;
    @Column()
    name;
    @Column('text', { nullable: true })
    description;
    // Add other item properties as needed, e.g., category, image, status
    @ManyToOne(() => User, user => user.items)
    owner;
    @OneToMany(() => Proposal, proposal => proposal.item)
    proposals;
}
//# sourceMappingURL=Item.js.map