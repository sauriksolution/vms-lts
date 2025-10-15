import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PredictedInviteData {
    @Field((type) => {return String})
    date: string;

    @Field((type) => {return Number})
    visitors: number;

    @Field((type) => {return Number})
    seat: number;
}
