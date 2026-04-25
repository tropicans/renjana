type EvaluationLinkLike = {
    registrationId?: string | null;
    answers?: unknown;
};

type EvaluationAnswersPayload = {
    registrationId?: string | null;
};

function getRegistrationIdFromAnswers(answers: unknown) {
    if (!answers || typeof answers !== "object") return null;

    const value = answers as EvaluationAnswersPayload;
    return typeof value.registrationId === "string" && value.registrationId.trim()
        ? value.registrationId
        : null;
}

export function getEvaluationRegistrationId(evaluation: EvaluationLinkLike) {
    return evaluation.registrationId ?? getRegistrationIdFromAnswers(evaluation.answers);
}
