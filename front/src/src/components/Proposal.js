import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Item } from './Item';
import { Rating } from './Rating';
import { ProposalStatus } from '../types'; // Import ProposalStatus
@Entity()
export class Proposal {
    @PrimaryGeneratedColumn()
    id;
    @ManyToOne(() => User, user => user.proposals)
    proposer; // User who made the proposal
    @ManyToOne(() => Item, item => item.proposals)
    item; // Item being proposed for
    @Column({
        type: 'enum',
        enum: ProposalStatus,
        default: ProposalStatus.PENDENTE,
    })
    status;
    @Column('text', { nullable: true })
    message;
    @OneToMany(() => Rating, rating => rating.proposal)
    ratings;
    @CreateDateColumn()
    createdAt;
    @UpdateDateColumn()
    updatedAt;
}
//# sourceMappingURL=Proposal.js.map